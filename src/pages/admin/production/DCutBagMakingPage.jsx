import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  TextField,
  IconButton,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import adminService from "../../../services/adminService";
import toast from "react-hot-toast";

import {
  Print,
  Update,
  LocalShipping,
  Search,
  Delete,
} from "@mui/icons-material";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";
export default function DCutBagMakingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDCutBagMaking(filters);
      setOrders(response.data || []);
    } catch (error) {
      toast.error(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: "",
      type: "",
      status: "all",
    });
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminService.updateProductionStatus(
        "d-cut-bag-making",
        orderId,
        newStatus
      );
      toast.success("Status updated successfully");
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMoveToDelivery = async (orderId) => {
    try {
      await adminService.moveToNextStage(
        "d-cut-bag-making",
        orderId,
        "delivery"
      );
      toast.success("Order moved to Delivery");
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
          <TextField
            select
            size="small"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </TextField>

          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Bag Type</TableCell>
                <TableCell>Handle Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Print Color</TableCell>
                <TableCell>GSM</TableCell>
                <TableCell>Scrap Quantity</TableCell>
                <TableCell>Status</TableCell>
                {/* <TableCell>Actions</TableCell> */}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <Typography>No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id || order.id}>
                    <TableCell>{formatSnakeCase(order.order_id)}</TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.jobName)}
                    </TableCell>
                    <TableCell>{order.orderDetails?.quantity}</TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.customerName)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.bagDetails?.type)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(
                        order.orderDetails?.bagDetails?.handleColor
                      )}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.bagDetails?.size)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.bagDetails?.color)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(
                        order.orderDetails?.bagDetails?.printColor
                      )}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.orderDetails?.bagDetails?.gsm)}
                    </TableCell>
                    <TableCell>{order.scrapQuantity || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(order.status)}
                        color={
                          order.status === "completed" ||
                          order.status === "delivered"
                            ? "success"
                            : order.status === "in_progress" ||
                              order.status === "pending"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    {/* <TableCell>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setOrderToDelete(order);
                  setDeleteDialogOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}
