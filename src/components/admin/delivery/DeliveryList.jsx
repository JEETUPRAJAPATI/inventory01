import { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Select,
  TableRow,
  Chip,
  TextField,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
} from "@mui/material";
import toast from "react-hot-toast";
import deliveryService from "/src/services/adminService.js"; // Make sure the service is correctly imported
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";
import DeleteConfirmDialog from "../../common/DeleteConfirmDialog";
import FormSelect from "../../common/FormSelect";
import { formatDate } from "../../../utils/dateUtils";
export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "all" });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // State for Edit Form Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    deliveryDate: "",
    driverContact: "",
    driverName: "",
    vehicleNo: "",
  });

  // Fetch Deliveries with Filters
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveries(filters);
      console.log("Deliveries:", response.data);
      setDeliveries(response.data);
    } catch (error) {
      toast.error("Error fetching deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  // Format date to 'YYYY-MM-DD'

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  const handleEditClick = (delivery) => {
    setSelectedDelivery(delivery);
    setEditForm({
      status: delivery.status,
      deliveryDate: new Date(delivery.deliveryDate).toISOString().split("T")[0],
      driverContact: delivery.driverContact,
      driverName: delivery.driverName,
      vehicleNo: delivery.vehicleNo,
    });
    setOpenEditDialog(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];
  const filteredDeliveries = deliveries.filter((delivery) => {
    console.log("delivery is a", delivery);
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      delivery.orderDetails?.orderId.toLowerCase().includes(searchLower) ||
      delivery.orderDetails?.customerName.toLowerCase().includes(searchLower) ||
      delivery.orderDetails?.jobName.toLowerCase().includes(searchLower);
    const matchesStatus =
      filters.status === "all" || delivery.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const handleSaveEdit = async () => {
    try {
      const response = await deliveryService.updateDelivery(
        selectedDelivery._id,
        editForm
      );
      toast.success("Delivery updated successfully");
      setOpenEditDialog(false);
      fetchDeliveries(); // Refresh the list after saving
    } catch (error) {
      toast.error("Error updating delivery");
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await deliveryService.deleteDelivery(userToDelete);

      toast.success("Delivery deleted successfully");
      fetchDeliveries(); // Refresh the list after deletion
    } catch (error) {
      toast.error("Error deleting delivery");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      in_transit: "info",
      delivered: "success",
    };
    return colors[status] || "default";
  };

  const filterOptions = {
    status: ["Pending", "In Transit", "Delivered"],
  };

  return (
    <>
      <Card sx={{ mb: 2, p: 2 }}>
        <Box
          sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, p: 2 }}
        >
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
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="done">Done</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={handleResetFilters}>
            Reset
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Dispatch Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No deliveries found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeliveries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        {formatSnakeCase(record.orderId || "N/A")}
                      </TableCell>
                      <TableCell>
                        {formatSnakeCase(
                          record.orderDetails?.customerName || "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatSnakeCase(record.orderDetails?.jobName || "N/A")}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.deliveryDate) || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatSnakeCase(record.status)}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(record)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(record._id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDeliveries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Edit Form Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Delivery</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={editForm.deliveryDate}
            onChange={handleEditFormChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Driver Contact"
            name="driverContact"
            value={editForm.driverContact}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Driver Name"
            name="driverName"
            value={editForm.driverName}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Vehicle Number"
            name="vehicleNo"
            value={editForm.vehicleNo}
            onChange={handleEditFormChange}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={editForm.status}
              onChange={handleEditFormChange}
              label="Status" // required for floating label to work
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteRecord}
        title="Delete Order"
        content="Are you sure you want to delete this order? This action cannot be undone."
      />
    </>
  );
}
