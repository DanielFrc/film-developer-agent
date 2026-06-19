from dataclasses import asdict, dataclass

from film_core.query import GoldStore, lookup_developing_times
from film_core.query.lookup import DevelopingTimeMatch
from film_llm.prompt import PromptContext, normalize_extra_context, render_recipe_prompt
from film_llm.providers import LLMProvider, get_llm_provider
from film_llm.recipe_cache import (
    CacheLookupParams,
    RecipeCacheService,
    build_cache_key,
)
from film_llm.settings import (
    DATA_SOURCE,
    DISCLAIMER,
    PROMPT_VERSION,
    RECIPE_LANGUAGE,
    SYSTEM_MESSAGE,
)
from film_llm.source_hash import compute_source_hash


class RecipeLookupError(LookupError):
    """Raised when no developing time exists for the requested combination."""


class RecipeAmbiguousError(LookupError):
    """Raised when multiple developing times match without a dilution filter."""


@dataclass(frozen=True)
class RecipeLookup:
    film: str
    developer: str
    format: str
    iso: str
    dilution: str
    base_time: str
    temperature: str | None
    notes: str | None


@dataclass(frozen=True)
class RecipeResult:
    recipe: str
    cached: bool
    cache_key: str
    source: str
    source_hash: str
    disclaimer: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    lookup: RecipeLookup
    extra_context: str | None = None

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["lookup"] = asdict(self.lookup)
        return payload


class RecipeService:
    def __init__(
        self,
        *,
        cache: RecipeCacheService | None = None,
        llm_provider: LLMProvider | None = None,
    ) -> None:
        self._cache = cache or RecipeCacheService()
        self._llm = llm_provider or get_llm_provider()

    def generate(
        self,
        *,
        film: str,
        developer: str,
        format: str,
        iso: str,
        dilution: str | None = None,
        extra_context: str | None = None,
        force_regenerate: bool = False,
    ) -> RecipeResult:
        normalized_context = normalize_extra_context(extra_context)
        lookup = self._resolve_lookup(
            film=film,
            developer=developer,
            format=format,
            iso=iso,
            dilution=dilution,
        )
        source_hash = compute_source_hash()
        cache_params = CacheLookupParams(
            film=lookup.film,
            developer=lookup.developer,
            format=lookup.format,
            iso=lookup.iso,
            dilution=lookup.dilution,
            temperature=lookup.temperature,
            base_time=lookup.base_time,
            prompt_version=PROMPT_VERSION,
            llm_provider=self._llm.provider_name,
            llm_model=self._llm.model_name,
            language=RECIPE_LANGUAGE,
            extra_context=normalized_context or "",
        )
        cache_key = build_cache_key(cache_params)

        if not force_regenerate:
            cached = self._cache.get(cache_key, current_source_hash=source_hash)
            if cached is not None:
                return RecipeResult(
                    recipe=cached.recipe_markdown,
                    cached=True,
                    cache_key=cache_key,
                    source=DATA_SOURCE,
                    source_hash=source_hash,
                    disclaimer=DISCLAIMER,
                    prompt_version=PROMPT_VERSION,
                    llm_provider=cached.llm_provider,
                    llm_model=cached.llm_model,
                    lookup=lookup,
                    extra_context=normalized_context,
                )

        prompt = render_recipe_prompt(
            PromptContext(
                film=lookup.film,
                developer=lookup.developer,
                format=lookup.format,
                iso=lookup.iso,
                base_time=lookup.base_time,
                temperature=lookup.temperature or "20",
                dilution=lookup.dilution,
                notes=lookup.notes,
                extra_context=normalized_context,
            )
        )
        llm_response = self._llm.generate(
            system_message=SYSTEM_MESSAGE,
            user_prompt=prompt,
        )
        recipe_text = self._append_disclaimer(llm_response.text)

        self._cache.store(
            cache_key=cache_key,
            params=cache_params,
            recipe_markdown=recipe_text,
            source_hash=source_hash,
        )

        return RecipeResult(
            recipe=recipe_text,
            cached=False,
            cache_key=cache_key,
            source=DATA_SOURCE,
            source_hash=source_hash,
            disclaimer=DISCLAIMER,
            prompt_version=PROMPT_VERSION,
            llm_provider=llm_response.provider,
            llm_model=llm_response.model,
            lookup=lookup,
            extra_context=normalized_context,
        )

    def _resolve_lookup(
        self,
        *,
        film: str,
        developer: str,
        format: str,
        iso: str,
        dilution: str | None,
    ) -> RecipeLookup:
        with GoldStore() as store:
            matches = lookup_developing_times(
                store,
                film=film,
                developer=developer,
                format=format,
                iso=iso,
                dilution=dilution,
            )

        if not matches:
            raise RecipeLookupError(
                "No developing time found for that film/developer/format/iso combination."
            )
        if len(matches) > 1 and not dilution:
            options = ", ".join(sorted({match.dilution or "n/a" for match in matches}))
            raise RecipeAmbiguousError(
                f"Multiple developing times found. Specify --dilution. Options: {options}"
            )

        match = matches[0]
        return self._match_to_lookup(match)

    @staticmethod
    def _match_to_lookup(match: DevelopingTimeMatch) -> RecipeLookup:
        return RecipeLookup(
            film=match.film,
            developer=match.developer,
            format=match.format,
            iso=match.iso,
            dilution=match.dilution or "stock",
            base_time=str(match.dev_time),
            temperature=match.temp,
            notes=match.notes,
        )

    @staticmethod
    def _append_disclaimer(recipe_text: str) -> str:
        if DISCLAIMER.lower() in recipe_text.lower():
            return recipe_text
        return f"{recipe_text.rstrip()}\n\n---\n{DISCLAIMER}"
