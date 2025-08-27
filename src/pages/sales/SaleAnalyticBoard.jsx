// components/dashboard/AnalyticsBoard.jsx
import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import toast from "react-hot-toast";
import salesOrderService from "../../services/orderService";
import SummaryCard from "../../components/dashboard/SummaryCard";

export default function SaleAnalyticBoard() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await salesOrderService.getOrderStats();
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch analytics stats");
      console.error("AnalyticsBoard: fetchStats error", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return null; // Optional: Replace with a loader/spinner if needed

  return (
    <Grid container spacing={2} className="p-2">
      {[
        { title: "Total Orders", data: stats.totalOrders, color: "primary" },
        {
          title: "Pending Orders",
          data: stats.pendingOrders,
          color: "warning",
        },
        {
          title: "Completed Orders",
          data: stats.completedOrders,
          color: "success",
        },
        {
          title: "Cancelled Orders",
          data: stats.cancelledOrders,
          color: "error",
        },
        { title: "Total Amount", data: stats.totalAmount, color: "info" },
      ].map((item, i) => (
        <Grid item xs={12} md={2.4} key={i} sx={{ flexGrow: 1 }}>
          <SummaryCard
            title={item.title}
            value={item.data?.value}
            changeFromLastMonth={item.data?.changeFromLastMonth}
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
