import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { filmApi } from "../../api/client";
import { NavBar } from "./NavBar";

export function AppShell() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    filmApi
      .health()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavBar apiStatus={apiStatus} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
