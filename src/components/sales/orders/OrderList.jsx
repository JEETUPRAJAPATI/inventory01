import { useState } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete, QrCode } from '@mui/icons-material';
import OrderForm from './OrderForm';
import QRCodeDialog from './QRCodeDialog';
import DeleteConfirmDialog from '../../common/DeleteConfirmDialog';
import { getStatusColor } from '../../../utils/statusColors';
import toast from 'react-hot-toast';
import orderService from '/src/services/orderService.js';

export default function OrderList({ orders, refreshOrders }) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered and searched orders
  const filteredOrders = orders
    .filter(order =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.jobName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(order => (statusFilter ? order.status === statusFilter : true));

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
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

  // Handle form submission (for add/edit)
  const handleFormSubmit = async (formData) => {
    try {
      // const message = selectedOrder ? 'Order updated successfully' : 'Order created successfully';
      // toast.success(message);
      setFormOpen(false);
      // Refresh orders after submission
      await refreshOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Confirm deletion
  const handleDeleteConfirm = async () => {
    try {
      await orderService.deleteOrder(orderToDelete._id);
      toast.success('Order deleted successfully');
      setDeleteDialogOpen(false);
      // Refresh orders after deletion
      await refreshOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">Orders</Typography>
          <div className="flex gap-3">
            {/* Search Box */}
            <TextField
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
              Add Order
            </Button>
          </div>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Bag Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Order Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.jobName}</TableCell>
                      <TableCell>{order.bagDetails.type}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.orderPrice}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(order)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(order)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              }
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
