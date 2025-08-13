import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import OrderList from "../../components/sales/orders/OrderList";
import SummaryCard from "../../components/dashboard/SummaryCard";
import orderService from "/src/services/orderService.js";
import toast from "react-hot-toast";
import SaleAnalyticBoard from "./SaleAnalyticBoard";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  // Fetch order list
  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Grid container spacing={3}>
      <SaleAnalyticBoard />

      <Grid item xs={12}>
        <OrderList orders={orders} refreshOrders={fetchOrders} />
      </Grid>
    </Grid>
  );
}
