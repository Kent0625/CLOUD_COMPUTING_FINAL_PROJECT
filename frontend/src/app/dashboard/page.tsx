"use client";

import { useEffect, useState } from "react";
import {
  fetchAnalyticsSales,
  fetchAnalyticsSummary,
  fetchCustomerAnalytics,
  fetchTopProducts,
} from "@/lib/api";
import { compactPesoFormatter, formatDate, numberFormatter } from "@/lib/format";
import type { AnalyticsSummary, CustomerPoint, SalesPoint, TopProduct } from "@/lib/types";

const emptySummary: AnalyticsSummary = {
  total_revenue: 0,
  total_orders: 0,
  total_customers: 0,
};

export default function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary>(emptySummary);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customers, setCustomers] = useState<CustomerPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [sumData, salesData, topData, customerData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAnalyticsSales(),
          fetchTopProducts(),
          fetchCustomerAnalytics(),
        ]);

        setSummary(sumData);
        setSales(salesData);
        setTopProducts(topData);
        setCustomers(customerData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Analytics are unavailable. Run the ETL job, then refresh this dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <main id="main-content" className="p-10 text-center min-h-screen" aria-live="polite">
        Loading analytics...
      </main>
    );
  }

  return (
    <main id="main-content" className="p-6 md:p-10 bg-[#F5F4F0] text-black min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-3">
              Reporting Database
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3" role="alert">
              {error}
            </p>
          )}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" aria-label="Analytics summary">
          <MetricCard label="Total Revenue" value={compactPesoFormatter.format(summary.total_revenue)} />
          <MetricCard label="Total Orders" value={numberFormatter.format(summary.total_orders)} />
          <MetricCard label="Customers" value={numberFormatter.format(summary.total_customers)} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <AnalyticsTable
            title="Daily Sales"
            emptyText="No sales data available yet."
            headers={["Date", "Orders", "Revenue"]}
            rows={sales.map((item) => [
              formatDate(item.date),
              numberFormatter.format(item.total_orders),
              compactPesoFormatter.format(item.total_revenue),
            ])}
          />

          <AnalyticsTable
            title="Top Selling Products"
            emptyText="No products sold yet."
            headers={["Product Name", "Units Sold"]}
            rows={topProducts.map((item) => [item.name, numberFormatter.format(item.sold_count)])}
          />

          <AnalyticsTable
            title="Customer Growth"
            emptyText="No customer data available yet."
            headers={["Date", "New Customers"]}
            rows={customers.map((item) => [formatDate(item.date), numberFormatter.format(item.new_customers)])}
          />
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 border border-black/10 bg-white/70">
      <h2 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">{label}</h2>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function AnalyticsTable({
  title,
  emptyText,
  headers,
  rows,
}: {
  title: string;
  emptyText: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10">
                {headers.map((header, index) => (
                  <th key={header} className={`py-3 font-bold ${index === 0 ? "text-left" : "text-right"}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join("-")} className="border-b border-black/5">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className={`py-3 ${index === 0 ? "text-left" : "text-right tabular-nums"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
