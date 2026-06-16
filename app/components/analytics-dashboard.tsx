"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { TenderRow, OrderRow } from "@/lib/tender-data";
import { format, parseISO } from "date-fns";

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

export function AnalyticsDashboard({
  tenders,
  orders,
}: {
  tenders: TenderRow[];
  orders: OrderRow[];
}) {
  const winLossData = useMemo(() => {
    let won = 0;
    let lost = 0;
    let pending = 0;
    
    tenders.forEach((t) => {
      const res = t.result?.toLowerCase() || "";
      if (res.includes("won")) won++;
      else if (res.includes("lost")) lost++;
      else pending++;
    });

    return [
      { name: "Won", value: won },
      { name: "Lost", value: lost },
      { name: "Pending", value: pending },
    ].filter(d => d.value > 0);
  }, [tenders]);

  const timelineData = useMemo(() => {
    const monthCounts: Record<string, { month: string; Tenders: number }> = {};
    
    tenders.forEach((t) => {
      if (t.publishedDate) {
        try {
          const date = parseISO(t.publishedDate);
          const month = format(date, "MMM yyyy");
          if (!monthCounts[month]) {
            monthCounts[month] = { month, Tenders: 0 };
          }
          monthCounts[month].Tenders++;
        } catch (e) {
          // ignore parsing errors
        }
      }
    });

    return Object.values(monthCounts);
  }, [tenders]);

  const ordersData = useMemo(() => {
    return orders
      .filter((o) => o.contractDate && o.totalOrderValue)
      .map((o) => {
        let val = 0;
        try {
          val = parseFloat(o.totalOrderValue.replace(/[^0-9.]/g, ""));
        } catch (e) {}
        
        return {
          name: o.organisation,
          value: val,
        };
      });
  }, [orders]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-4 md:grid-cols-2">
        
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Win / Loss Ratio</h3>
          <div className="h-64 w-full">
            {winLossData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Not enough data
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Tenders Published Over Time</h3>
          <div className="h-64 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickMargin={10} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="Tenders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Not enough data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">Order Values by Organisation</h3>
        <div className="h-64 w-full">
          {ordersData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} tick={{ width: 100 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Not enough data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
