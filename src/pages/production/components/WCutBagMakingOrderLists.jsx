import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Card,
  Box,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { Print, Update, LocalShipping } from "@mui/icons-material";
import toast from "react-hot-toast";
import OrderService from "../../../services/wcutBagMakingServices";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";

export default function WCutBagMakingOrderLists({
  orders,
  noOrdersFound,
  onStatusUpdated,
}) {
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [updateScrapModalOpen, setUpdateScrapModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [unitToUpdate, setUnitToUpdate] = useState("");
  const [scrapToUpdate, setScrapToUpdate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusColor = (status) =>
    ({
      pending: "warning",
      in_progress: "info",
      completed: "success",
    }[status] || "default");

  const updateOrderStatus = (orderId, newStatus, unitNumber, remarks) => {
    OrderService.updateOrderStatus(orderId, newStatus, unitNumber, remarks)
      .then(() => {
        toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
        setUpdateStatusModalOpen(false);
        setUnitToUpdate("");
        onStatusUpdated();
      })
      .catch(() => {
        toast.error("Failed to update order status");
      });
  };

  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setUpdateStatusModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!unitToUpdate) {
      toast.error("Please select a unit number");
      return;
    }
    updateOrderStatus(
      selectedOrderId,
      "completed",
      unitToUpdate,
      "Order moved to completed"
    );
  };

  const handleMoveToDelivery = () => {
    if (!scrapToUpdate || parseInt(scrapToUpdate) < 0) {
      toast.error("Please enter a valid scrap amount.");
      return;
    }

    const orderId = selectedOrder?.orderId;
    if (!orderId) {
      toast.error("Invalid order selected.");
      return;
    }

    OrderService.moveToDelivery(orderId, scrapToUpdate)
      .then(() => {
        toast.success("Order moved to packaging");
        onStatusUpdated();
        setUpdateScrapModalOpen(false);
        setScrapToUpdate("");
        setSelectedOrder(null);
      })
      .catch(() => {
        toast.error("Failed to move to packaging");
      });
  };

  const handleOpenScrapModal = (order) => {
    setSelectedOrder(order);
    setUpdateScrapModalOpen(true);
  };

  return (
    <Box>
      <TableContainer component={Card} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Job Name</TableCell>
              <TableCell>Roll Size</TableCell>
              <TableCell>GSM</TableCell>
              <TableCell>Bag Color</TableCell>
              <TableCell>Print Color</TableCell>
              <TableCell>Fabric Type</TableCell>
              <TableCell>Fabric Quality</TableCell>
              <TableCell>Bag Type</TableCell>
              <TableCell>Bag Size</TableCell>
              <TableCell>Cylinder Size</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {noOrdersFound ? (
              <TableRow>
                <TableCell colSpan={15} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No Orders Found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.jobName}</TableCell>
                  <TableCell>
                    {order.productionManagers?.[0]?.production_details
                      ?.roll_size || "-"}
                  </TableCell>
                  <TableCell>{order.bagDetails?.gsm ? parseFloat(order.bagDetails.gsm).toFixed(2) : "-"}</TableCell>
                  <TableCell>{order.bagDetails?.color || "-"}</TableCell>
                  <TableCell>{order.bagDetails?.printColor || "-"}</TableCell>
                  <TableCell>
                    {order.productionManagers?.[0]?.production_details?.type ||
                      "-"}
                  </TableCell>
                  <TableCell>{order.fabricQuality || "-"}</TableCell>
                  <TableCell>
                    {formatSnakeCase(order.bagDetails?.type) || "-"}
                  </TableCell>
                  <TableCell>{order.bagDetails?.size || "-"}</TableCell>
                  <TableCell>
                    {order.productionManagers?.[0]?.production_details
                      ?.cylinder_size || "-"}
                  </TableCell>
                  <TableCell>{parseFloat(order.quantity || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {order.productionManagers?.[0]?.production_details
                      ?.remarks ||
                      order.remarks ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.opsertDetails[0]?.status
                        .replace("_", " ")
                        .toUpperCase()}
                      color={getStatusColor(order.opsertDetails[0]?.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                      }}
                    >
                      {order.opsertDetails[0]?.status === "pending" && (
                        <Tooltip title="Start Printing" arrow>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            onClick={() =>
                              updateOrderStatus(
                                order.orderId,
                                "in_progress",
                                "",
                                "Printing started"
                              )
                            }
                          >
                            <Print />
                          </Button>
                        </Tooltip>
                      )}

                      {order.opsertDetails[0]?.status === "in_progress" && (
                        <Tooltip title="Complete Printing" arrow>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            fullWidth
                            onClick={() => handleOpenModal(order.orderId)}
                          >
                            <Update />
                          </Button>
                        </Tooltip>
                      )}

                      {order.opsertDetails[0]?.status === "completed" && (
                        <Tooltip title="Move to Packaging" arrow>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            onClick={() => handleOpenScrapModal(order)}
                          >
                            <LocalShipping />
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Complete Order Modal */}
      <Modal
        open={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Complete Order - Add Details
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Unit Number</InputLabel>
            <Select
              value={unitToUpdate}
              onChange={(e) => setUnitToUpdate(e.target.value)}
              label="Unit Number"
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-between" }}>
            <Button
              onClick={() => setUpdateStatusModalOpen(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleStatusUpdate}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Scrap Quantity Modal */}
      <Modal
        open={updateScrapModalOpen}
        onClose={() => setUpdateScrapModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Enter Scrap Quantity - WCut Bag Making
          </Typography>
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Scrap Quantity"
            type="number"
            value={scrapToUpdate}
            onChange={(e) => {
              if (e.target.value > selectedOrder?.quantity) {
                toast.error(
                  "Scrap quantity cannot be more than order quantity."
                );
                return;
              }

              setScrapToUpdate(e.target.value);
            }}
            inputProps={{ min: 0 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => setUpdateScrapModalOpen(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleMoveToDelivery}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

// Modal Styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
