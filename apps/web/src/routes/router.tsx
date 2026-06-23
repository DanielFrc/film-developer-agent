import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { SearchPage } from "../pages/SearchPage";
import { RecipePage } from "../pages/RecipePage";
import { ExplorerPage } from "../pages/ExplorerPage";
import { LibraryPage } from "../pages/LibraryPage";
import { ComparePage } from "../pages/ComparePage";
import { SessionPage } from "../pages/SessionPage";
import { PreferencesPage } from "../pages/PreferencesPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "compare", element: <ComparePage /> },
      { path: "session", element: <SessionPage /> },
      { path: "recipe", element: <RecipePage /> },
      { path: "explorer", element: <ExplorerPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "preferences", element: <PreferencesPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
