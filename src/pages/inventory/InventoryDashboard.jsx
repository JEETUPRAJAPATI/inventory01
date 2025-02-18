import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import SummaryCard from '../../components/dashboard/SummaryCard';
import ChartCard from '../../components/dashboard/ChartCard';
import RecentActivities from '../../components/dashboard/RecentActivities';
import productService from '../../services/productService';
import purchaseOrderService from '../../services/purchaseOrderService';
import { API_BASE_URL } from "../../config/constants";
import toast from 'react-hot-toast';
import authService from "../../services/authService";
import axios from "axios";

export default function InventoryDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to hold calculated values
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [rawMaterialsCount, setRawMaterialsCount] = useState(0);
  const [finishedProductsCount, setFinishedProductsCount] = useState(0);
  const [lowStockItemsCount, setLowStockItemsCount] = useState(0);

  const [chartData, setChartData] = useState([]);

  // Fetch purchase orders
  const fetchOrders = async () => {
    try {
      const response = await purchaseOrderService.getOrders();
      setOrders(response.data);
      // Calculate total stock value
      const totalValue = response.data.reduce((acc, order) => acc + order.totalAmount, 0);
      setTotalStockValue(totalValue);

      const monthlyData = response.data.reduce((acc, order) => {
        const date = new Date(order.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });

        if (!acc[month]) {
          acc[month] = { name: month, revenue: 0, orders: 0 };
        }
        acc[month].revenue += order.totalAmount;
        acc[month].orders += 1;
        return acc;
      }, {});

      // Convert object to array and sort by month
      const sortedData = Object.values(monthlyData).sort((a, b) =>
        new Date(`1 ${a.name} 2024`) - new Date(`1 ${b.name} 2024`)
      );

      setChartData(sortedData);

    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
      // Calculate raw materials count (assuming raw materials are products)
      console.log('production row matirial lenght', response.data);
      setFinishedProductsCount(response.data.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);  // Fallback to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      const responseData = await axios.get(`${API_BASE_URL}/inventory/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log('inventory response', responseData);
      setCategories(responseData.data.data);
      const totalRawMaterials = responseData.data.data.length;
      setRawMaterialsCount(totalRawMaterials);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Calculate finished products and low stock items
  useEffect(() => {
    // Calculate finished products (status 'delivered'
    // Calculate low stock items (e.g., if quantity is less than 10, or based on other criteria)
    const lowStockThreshold = 10;
    const lowStockItems = products.filter(product => product.quantity < lowStockThreshold).length;
    setLowStockItemsCount(lowStockItems);
  }, [orders, products]);

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryCard
          title="Total Stock Value"
          value={`₹${totalStockValue.toLocaleString()}`}
          increase="+8%"
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryCard
          title="Raw Materials"
          value={`${rawMaterialsCount} units`}
          increase="+5%"
          color="info"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryCard
          title="Finished Products"
          value={`${finishedProductsCount} units`}
          increase="+12%"
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryCard
          title="Low Stock Items"
          value={`${lowStockItemsCount}`}
          increase="-15%"
          color="warning"
        />
      </Grid>
      <Grid item xs={12} md={8}>
        <ChartCard data={chartData} />
      </Grid>
      <Grid item xs={12} md={4}>
        <RecentActivities />
      </Grid>
    </Grid>
  );
}
