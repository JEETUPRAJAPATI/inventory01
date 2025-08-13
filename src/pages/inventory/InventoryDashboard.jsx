import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import SummaryCard from "../../components/dashboard/SummaryCard";
import ChartCard from "../../components/dashboard/ChartCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import { API_BASE_URL } from "../../config/constants";
import toast from "react-hot-toast";
import authService from "../../services/authService";
import axios from "axios";
import Loader from "../../utils/Loader";

export default function InventoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchInventoryStats = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Unauthorized: No token provided");

      const { data } = await axios.get(
        `${API_BASE_URL}/inventory/inventory-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("Failed to load inventory stats");
      }
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      toast.error("Error loading inventory stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryStats();
  }, []);
  if (loading) return <Loader />;
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Raw Materials"
          value={`${stats.totalRawMaterials.toLocaleString()}`}
          increase=""
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Invoices"
          value={`${stats.totalInvoices.toLocaleString()}`}
          increase=""
          color="info"
        />
      </Grid>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Packages"
          value={`${stats.totalPackages.toLocaleString()}`}
          increase=""
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Deliveries"
          value={`${stats.totalDeliveries.toLocaleString()}`}
          increase=""
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Finished Products"
          value={`${stats.totalFinishedProducts.toLocaleString()}`}
          increase=""
          color="info"
        />
      </Grid>
      <Grid item xs={12} md={2} lg={2}>
        <SummaryCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          increase=""
          color="info"
        />
      </Grid>
      <Grid item xs={12} md={8}>
        <ChartCard data={stats.graphData} />
      </Grid>
      <Grid item xs={12} md={4}>
        <RecentActivities />
      </Grid>
    </Grid>
  );
}
