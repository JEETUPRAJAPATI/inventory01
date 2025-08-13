import { useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Button,
  Chip,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  Box,
  Stack,
} from "@mui/material";
import { Add, Edit, Delete, QrCode, Download } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import OrderForm from "./OrderForm";
import QRCodeDialog from "./QRCodeDialog";
import DeleteConfirmDialog from "../../common/DeleteConfirmDialog";
import { getStatusColor } from "../../../utils/statusColors";
import toast from "react-hot-toast";
import orderService from "/src/services/orderService.js";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";
import { formatToIndianDateTimeLines } from "../../../utils/dateUtils";

export default function OrderList({ orders, refreshOrders }) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered and searched orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    const orderDate = new Date(order.createdAt);
    const matchesDateRange =
      (!startDate || orderDate >= startDate) &&
      (!endDate || orderDate <= endDate);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormOpen(true);
  };

  const handleDelete = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleShowQR = (order) => {
    setSelectedQrOrder(order);
    setQrDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormOpen(false);
      await refreshOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await orderService.deleteOrder(orderToDelete._id);
      toast.success("Order deleted successfully");
      setDeleteDialogOpen(false);
      await refreshOrders();
    } catch (error) {
      toast.error(error.message || "Failed to delete order");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = filteredOrders.map((order) => ({
      "Order ID": order.orderId,
      "Customer Name": order.customerName,
      "Job Name": order.jobName,
      "Bag Type": order.bagDetails.type,
      Quantity: order.quantity,
      "Order Value": order.orderPrice,
      Status: order.status.toUpperCase(),
      "Order Date": new Date(order.createdAt).toLocaleDateString(),
      "Mobile Number": order.mobileNumber,
      Email: order.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(
      workbook,
      `orders_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = "Orders Report";
    const headers = [
      [
        "Order ID",
        "Customer Name",
        "Job Name",
        "Bag Type",
        "Quantity",
        "Order Value",
        "Status",
      ],
    ];

    const data = filteredOrders.map((order) => [
      order.orderId,
      order.customerName,
      order.jobName,
      order.bagDetails.type,
      order.quantity,
      order.orderPrice,
      order.status.toUpperCase(),
    ]);

    doc.text(title, 14, 15);
    doc.autoTable({
      head: headers,
      body: data,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`orders_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <>
      <Card sx={{ mb: 2, p: 2 }}>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">Orders</Typography>
          <div className="flex gap-3">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Download />}
              onClick={exportToExcel}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Download />}
              onClick={exportToPDF}
            >
              PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAdd}
            >
              Add Order
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            {/* Search Box */}
            <TextField
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>

            {/* Date Range Picker */}
            <LocalizationProvider
              className="dates-input"
              dateAdapter={AdapterDateFns}
            >
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ minWidth: 150 }} />
                )}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ minWidth: 150 }} />
                )}
              />
            </LocalizationProvider>

            <Button
              variant="outlined"
              color="inherit"
              onClick={clearFilters}
              size="medium"
            >
              Clear Filters
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Bag Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order, index) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{formatSnakeCase(order.customerName)}</TableCell>
                    <TableCell>{formatSnakeCase(order.jobName)}</TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails.type)}
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.orderPrice}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatToIndianDateTimeLines(order.createdAt)
                        .split("\n")
                        .map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                    </TableCell>
                    <TableCell>
                      {formatToIndianDateTimeLines(order.updatedAt)
                        .split("\n")
                        .map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(order)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        order={selectedOrder}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        content="Are you sure you want to delete this order? This action cannot be undone."
      />
    </>
  );
}
