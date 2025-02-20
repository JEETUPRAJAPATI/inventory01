import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import SummaryCard from "../../components/dashboard/SummaryCard";
import ProductionOverview from "../../components/admin/ProductionOverview";
import InventoryOverview from "../../components/admin/InventoryOverview";
import RecentOrders from "../../components/sales/dashboard/RecentOrders";
import DeliveryList from "../../components/admin/RecentDelivery";

import adminService from "../../services/adminService";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Fetching dashboard data..."); // Debugging
        const response = await adminService.getDashboardOverview();
        console.log("API Response:", response.data);
        setDashboardData(response.data); // Assuming response structure: { success: true, data: { ... } }
      } catch (error) {
        console.error("API Error:", error.response || error.message);
        setError(error.message);
      }
    };
    fetchDashboardData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!dashboardData) return <p>Loading...</p>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Total Sales"
          value={`₹${dashboardData.totalOrderValue.toLocaleString()}`}
          increase="+12%"
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Production Orders"
          value={dashboardData.totalSalesOrders}
          increase="+8%"
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Pending Deliveries"
          value={dashboardData.totalPendingDeliveries}
          increase="-5%"
          color="warning"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <SummaryCard
          title="Total Active Users"
          value={dashboardData.totalActiveUsers}
          increase="+10%"
          color="info"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <RecentOrders adminView />
      </Grid>
      <Grid item xs={12} md={6}>
        <ProductionOverview />
      </Grid>
      <Grid item xs={12} md={6}>
        <DeliveryList adminView />
      </Grid>
      <Grid item xs={12} md={6}>
        <InventoryOverview />
      </Grid>
    </Grid>
  );
}
