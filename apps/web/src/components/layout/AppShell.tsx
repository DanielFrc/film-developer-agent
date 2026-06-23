import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { filmApi } from "../../api/client";
import { NavBar } from "./NavBar";
import { OfflineNotice } from "./OfflineNotice";

export function AppShell() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    filmApi
      .health()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
      setApiStatus("error");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="print:hidden">
        <OfflineNotice online={online} />
        <NavBar apiStatus={apiStatus} />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
        <Outlet />
      </main>
    </div>
  );
}
