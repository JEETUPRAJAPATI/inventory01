import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import SummaryCard from "../../../components/dashboard/SummaryCard";
import ProductionOverview from "../../../components/admin/ProductionOverview";
import adminService from "../../../services/adminService";
export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalProduction: 0,
    activeOrders: 0,
    completedToday: 0,
    efficiencyRate: "N/A",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getProductionStats();
        // Assuming your API returns data in this structure:
        // { totalProducts, activeOrders, completedOrders, efficiency }
        setStats({
          totalProduction: data.data.totalProducts || 0,
          activeOrders: data.data.activeOrders || 0,
          completedToday: data.data.completedOrders || 0,
          efficiencyRate: data.data.efficiency || "N/A",
        });
      } catch (error) {
        console.error("Failed to fetch production stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Grid container spacing={3}>
      {[
        {
          title: "Total Production",
          value: stats.totalProduction,
          color: "primary",
        },
        { title: "Active Orders", value: stats.activeOrders, color: "warning" },
        {
          title: "Completed Today",
          value: stats.completedToday,
          color: "success",
        },
        {
          title: "Efficiency Rate",
          value: stats.efficiencyRate,
          color: "info",
        },
      ].map(({ title, value, color }) => (
        <Grid item xs={12} md={3} key={title}>
          <SummaryCard title={title} value={value} color={color} />
        </Grid>
      ))}

      <Grid item xs={12}>
        <ProductionOverview />
      </Grid>
      {/* Uncomment if needed */}
      {/* <Grid item xs={12}>
        <InventoryOverview />
      </Grid> */}
    </Grid>
  );
}
