"use client";

import { useEffect, useState } from "react";
import { fetchAnalyticsSummary, fetchAnalyticsSales, fetchTopProducts } from "@/lib/api";

export default function Dashboard() {
  const [summary, setSummary] = useState({ total_revenue: 0, total_orders: 0, total_customers: 0 });
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumData, salesData, topData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAnalyticsSales(),
          fetchTopProducts()
        ]);
        setSummary(sumData);
        setSales(salesData);
        setTopProducts(topData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return (
    <div className="p-10 bg-white text-black min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold">${summary.total_revenue.toFixed(2)}</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{summary.total_orders}</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Customers</h2>
          <p className="text-3xl font-bold">{summary.total_customers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">Daily Sales</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500">No sales data available yet.</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Orders</th>
                  <th className="text-right py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{s.date}</td>
                    <td className="text-right py-2">{s.total_orders}</td>
                    <td className="text-right py-2">${s.total_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No products sold yet.</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product Name</th>
                  <th className="text-right py-2">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td className="text-right py-2">{p.sold_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
