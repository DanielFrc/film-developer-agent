import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { SearchPage } from "../pages/SearchPage";
import { RecipePage } from "../pages/RecipePage";
import { ExplorerPage } from "../pages/ExplorerPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "recipe", element: <RecipePage /> },
      { path: "explorer", element: <ExplorerPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
