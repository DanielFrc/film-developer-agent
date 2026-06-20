import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-2xl font-semibold text-ink">Page not found</h2>
      <p className="mt-2 text-sm text-muted">The screen you requested does not exist.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
