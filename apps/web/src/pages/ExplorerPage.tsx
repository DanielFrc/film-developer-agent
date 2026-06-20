import { PageHeader } from "../components/layout/PageHeader";
import { DataExplorer } from "../components/explorer/DataExplorer";

export function ExplorerPage() {
  return (
    <div>
      <PageHeader
        title="Data Explorer"
        description="Inspect Bronze, Silver, and Gold pipeline layers with filters, schema view, and CSV export."
      />
      <DataExplorer />
    </div>
  );
}
