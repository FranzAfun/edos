import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Reports Module (F25, F26)
 * F25: Financial Reports — Revenue, Budget, Treasury, P&L reports
 * F26: Export to PDF/Excel using jspdf + xlsx
 */
import { useState, useMemo, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import DataTable from "../../../shared/ui/DataTable";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import * as assetStore from "../../../shared/services/assetStore";
import * as receiptStore from "../../../shared/services/receiptStore";

async function exportToExcel(data, columns, fileName) {
  const XLSX = await import("xlsx");
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      return val != null ? val : "";
    })
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

async function exportToPdf(data, columns, title) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 20);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 32,
    head: [columns.map((c) => c.label)],
    body: data.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        return val != null ? String(val) : "";
      })
    ),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [15, 23, 42] },
  });
  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

const REPORT_TYPES = [
  { key: "revenue", label: "Revenue Report" },
  { key: "budget", label: "Budget Report" },
  { key: "approvals", label: "Approvals Report" },
  { key: "assets", label: "Asset Report" },
  { key: "receipts", label: "Receipts Report" },
  { key: "treasury", label: "Treasury Summary" },
];

export default function ReportsPage() {
  useDocumentTitle("Reports");
  const [activeReport, setActiveReport] = useState("revenue");

  return (
    <div>
      <PageSection title="Reports" subtitle="Generate and export organizational reports">
        <div className="flex gap-1 flex-wrap mb-4">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.key}
              onClick={() => setActiveReport(rt.key)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeReport === rt.key
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        {activeReport === "revenue" && <RevenueReport />}
        {activeReport === "budget" && <BudgetReport />}
        {activeReport === "approvals" && <ApprovalsReport />}
        {activeReport === "assets" && <AssetReport />}
        {activeReport === "receipts" && <ReceiptsReport />}
        {activeReport === "treasury" && <TreasurySummary />}
      </PageSection>
    </div>
  );
}

function ExportButtons({ data, columns, title }) {
  const [exporting, setExporting] = useState(false);

  const handleExcel = useCallback(async () => {
    setExporting(true);
    try { await exportToExcel(data, columns, title); } catch (e) { console.error(e); }
    setExporting(false);
  }, [data, columns, title]);

  const handlePdf = useCallback(async () => {
    setExporting(true);
    try { await exportToPdf(data, columns, title); } catch (e) { console.error(e); }
    setExporting(false);
  }, [data, columns, title]);

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={handleExcel}
        disabled={exporting || data.length === 0}
        className="rounded border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Export Excel
      </button>
      <button
        onClick={handlePdf}
        disabled={exporting || data.length === 0}
        className="rounded border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Export PDF
      </button>
    </div>
  );
}

function RevenueReport() {
  const revenue = useMemo(() => revenueStore.listRevenue(), []);
  const columns = [
    { key: "pillar", label: "Pillar" },
    { key: "program", label: "Program" },
    { key: "productService", label: "Product/Service" },
    { key: "amount", label: "Amount (GHS)" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "customerType", label: "Customer Type" },
    { key: "profitCategory", label: "Category" },
    { key: "recordedAt", label: "Date" },
  ];
  return (
    <div>
      <ExportButtons data={revenue} columns={columns} title="Revenue_Report" />
      <DataTable columns={columns} data={revenue} pageSize={10} emptyText="No revenue data." />
    </div>
  );
}

function BudgetReport() {
  const departments = departmentStore.listDepartments();
  const budgets = useMemo(
    () =>
      budgetStore.listBudgets().map((b) => {
        const dept = departments.find((d) => d.id === b.departmentId);
        return {
          ...b,
          departmentName: dept?.name || b.departmentId,
          spent: (b.monthlyLimit || 0) - (b.remainingLimit || 0),
          utilization:
            b.monthlyLimit > 0
              ? `${Math.round((((b.monthlyLimit || 0) - (b.remainingLimit || 0)) / b.monthlyLimit) * 100)}%`
              : "0%",
          status: b.frozen ? "Frozen" : "Active",
        };
      }),
    [departments]
  );
  const columns = [
    { key: "departmentName", label: "Department" },
    { key: "monthlyLimit", label: "Monthly Limit (GHS)" },
    { key: "spent", label: "Spent (GHS)" },
    { key: "remainingLimit", label: "Remaining (GHS)" },
    { key: "utilization", label: "Utilization" },
    { key: "status", label: "Status" },
  ];
  return (
    <div>
      <ExportButtons data={budgets} columns={columns} title="Budget_Report" />
      <DataTable columns={columns} data={budgets} pageSize={12} emptyText="No budget data." />
    </div>
  );
}

function ApprovalsReport() {
  const approvals = useMemo(() => approvalStore.listApprovals(), []);
  const columns = [
    { key: "title", label: "Title" },
    { key: "amount", label: "Amount (GHS)" },
    { key: "sourceType", label: "Source" },
    { key: "currentStage", label: "Stage" },
    { key: "createdAt", label: "Created" },
  ];
  return (
    <div>
      <ExportButtons data={approvals} columns={columns} title="Approvals_Report" />
      <DataTable columns={columns} data={approvals} pageSize={10} emptyText="No approval data." />
    </div>
  );
}

function AssetReport() {
  const departments = departmentStore.listDepartments();
  const assets = useMemo(
    () =>
      assetStore.listAssets().map((a) => {
        const dep = assetStore.computeDepreciation(a);
        const dept = departments.find((d) => d.id === a.departmentId);
        return {
          ...a,
          departmentName: dept?.name || a.departmentId,
          currentValue: Math.round(dep.currentValue),
          annualDepreciation: Math.round(dep.annualDepreciation),
          age: dep.age,
          remainingLife: dep.remainingLife,
        };
      }),
    [departments]
  );
  const columns = [
    { key: "name", label: "Asset" },
    { key: "category", label: "Category" },
    { key: "departmentName", label: "Department" },
    { key: "condition", label: "Condition" },
    { key: "purchaseCost", label: "Purchase Cost (GHS)" },
    { key: "currentValue", label: "Current Value (GHS)" },
    { key: "annualDepreciation", label: "Annual Dep. (GHS)" },
    { key: "age", label: "Age (yrs)" },
    { key: "remainingLife", label: "Life Left (yrs)" },
  ];
  return (
    <div>
      <ExportButtons data={assets} columns={columns} title="Asset_Report" />
      <DataTable columns={columns} data={assets} pageSize={10} emptyText="No asset data." />
    </div>
  );
}

function ReceiptsReport() {
  const receipts = useMemo(() => receiptStore.listReceipts(), []);
  const columns = [
    { key: "verificationStatus", label: "Status" },
    { key: "vendorName", label: "Vendor" },
    { key: "actualAmount", label: "Amount (GHS)" },
    { key: "fileName", label: "File" },
    { key: "receiptDate", label: "Receipt Date" },
    { key: "authorizedAt", label: "Authorized" },
  ];
  return (
    <div>
      <ExportButtons data={receipts} columns={columns} title="Receipts_Report" />
      <DataTable columns={columns} data={receipts} pageSize={10} emptyText="No receipt data." />
    </div>
  );
}

function TreasurySummary() {
  const treasury = treasuryStore.getTreasury();
  const budgets = budgetStore.listBudgets();
  const totalAllocated = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const totalRemaining = budgets.reduce((s, b) => s + (b.remainingLimit || 0), 0);
  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();

  const summaryData = [
    { metric: "Treasury Balance", value: `GHS ${treasury.balance.toLocaleString()}` },
    { metric: "Total Revenue", value: `GHS ${totalRevenue.toLocaleString()}` },
    { metric: "Confirmed Revenue", value: `GHS ${confirmedRevenue.toLocaleString()}` },
    { metric: "Total Budget Allocated", value: `GHS ${totalAllocated.toLocaleString()}` },
    { metric: "Budget Remaining", value: `GHS ${totalRemaining.toLocaleString()}` },
    { metric: "Budget Spent", value: `GHS ${(totalAllocated - totalRemaining).toLocaleString()}` },
  ];
  const columns = [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ];
  return (
    <div>
      <ExportButtons data={summaryData} columns={columns} title="Treasury_Summary" />
      <Grid cols={3}>
        {summaryData.map((s) => (
          <Card key={s.metric}>
            <p className="text-xs text-gray-500">{s.metric}</p>
            <p className="text-lg font-bold mt-1">{s.value}</p>
          </Card>
        ))}
      </Grid>
    </div>
  );
}


