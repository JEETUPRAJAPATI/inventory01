import { useState, useEffect } from "react";
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
  Chip,
  Box,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Edit, Visibility } from "@mui/icons-material";
import toast from "react-hot-toast";
import deliveryService from "../../services/deliveryService";
import DeliveryDetailsModal from "./DeliveryDetailsModal";
import DeliveryFilters from "./DeliveryFilters";
import { formatSnakeCase } from "../../utils/formatSnakeCase";
import { formatDate } from "../../utils/dateUtils";

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    timeRange: "month",
    page: 1,
    limit: 10,
  });
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [deliveryToUpdate, setDeliveryToUpdate] = useState(null);

  // Fetch deliveries
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveries(filters);
      setDeliveries(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  // Handle viewing delivery details
  const handleView = async (deliveryId) => {
    try {
      const delivery = await deliveryService.getDeliveryById(deliveryId);
      setSelectedDelivery(delivery);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle opening the update status modal
  const handleStatusUpdateClick = (delivery) => {
    setDeliveryToUpdate(delivery);
    setStatusToUpdate(delivery.status);
    setUpdateStatusModalOpen(true);
  };

  // Handle updating the delivery status
  const handleStatusUpdate = async () => {
    try {
      await deliveryService.updateDeliveryStatus(
        deliveryToUpdate._id,
        statusToUpdate
      );
      toast.success(`Delivery status updated to ${statusToUpdate}`);
      fetchDeliveries();
      setUpdateStatusModalOpen(false); // Close the modal
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      in_transit: "info",
      delivered: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <DeliveryFilters filters={filters} onFilterChange={setFilters} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Delivery Date</TableCell>
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
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No deliveries found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell>{formatSnakeCase(delivery.orderId)}</TableCell>
                    <TableCell>
                      {formatSnakeCase(delivery.orderDetails?.customerName)}
                    </TableCell>
                    <TableCell>
                      {delivery.orderDetails?.mobileNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      {formatDate(delivery.deliveryDate) || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(delivery.status)}
                        color={getStatusColor(delivery.status || "default")}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(delivery._id)}
                      >
                        <Visibility />
                      </IconButton>

                      {delivery.status !== "delivered" && (
                        <Button
                          size="small"
                          // variant="contained"
                          color="secondary"
                          onClick={() => handleStatusUpdateClick(delivery)}
                          sx={{ ml: 1 }}
                        >
                          <Edit />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        open={!!selectedDelivery}
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />

      {/* Update Status Modal */}
      <Modal
        open={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Update Delivery Status
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => setUpdateStatusModalOpen(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleStatusUpdate}>
              Update
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
