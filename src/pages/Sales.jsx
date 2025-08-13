import { Grid } from "@mui/material";
import SummaryCard from "../components/dashboard/SummaryCard";
import RecentOrders from "../components/sales/dashboard/RecentOrders";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import orderService from "/src/services/orderService.js";
import SaleAnalyticBoard from "./sales/SaleAnalyticBoard";
export default function Sales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Grid container spacing={3}>
      <SaleAnalyticBoard />

      <Grid item xs={12}>
        <RecentOrders />
      </Grid>
    </Grid>
  );
}
