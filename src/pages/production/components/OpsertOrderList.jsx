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
  IconButton,
} from "@mui/material";
import { Print, Update, LocalShipping } from "@mui/icons-material";
import toast from "react-hot-toast";
import OrderService from "../../../services/dcutOpsertService.js";
import { formatSnakeCase } from "../../../utils/formatSnakeCase.js";

export default function OpsertOrderList({
  orders,
  status,
  noOrdersFound,
  onStatusUpdated,
}) {
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [unitToUpdate, setUnitToUpdate] = useState("");
  const getStatusColor = (status) =>
    ({
      pending: "warning",
      in_progress: "info",
      completed: "success",
    }[status] || "default");

  const updateOrderStatus = (orderId, newStatus, unitToUpdate, remarks) => {
    OrderService.updateOrderStatus(orderId, newStatus, unitToUpdate, remarks)
      .then(() => {
        toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
        setUpdateStatusModalOpen(false);
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
      "order move to completed"
    );
  };
  const handleMoveToPackaging = (orderId) => {
    OrderService.moveToPackaging(orderId)
      .then(() => {
        toast.success("Order moved to packaging");
        onStatusUpdated();
      })
      .catch((error) => {
        toast.error("Failed to move to packaging");
      });
  };
  return (
    <Box>
      {/* Desktop View */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer component={Card}>
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
                    <TableCell>{order.bagDetails?.gsm || "-"}</TableCell>
                    <TableCell>{order.bagDetails?.color || "-"}</TableCell>
                    <TableCell>{order.bagDetails?.printColor || "-"}</TableCell>
                    <TableCell>
                      {order.productionManagers?.[0]?.production_details
                        ?.type || "-"}
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
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      {order.productionManagers?.[0]?.production_details
                        ?.remarks ||
                        order.remarks ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(order.opsertDetails[0].status)}
                        color={getStatusColor(order.opsertDetails[0].status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {order.opsertDetails[0].status === "pending" && (
                        <Tooltip title="Start Printing" arrow>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              updateOrderStatus(
                                order.orderId,
                                "in_progress",
                                "Printing started"
                              )
                            }
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                      )}

                      {order.opsertDetails[0].status === "in_progress" && (
                        <Tooltip title="Complete Order" arrow>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleOpenModal(order.orderId)}
                          >
                            <Update />
                          </IconButton>
                        </Tooltip>
                      )}

                      {order.opsertDetails[0].status === "completed" && (
                        <Tooltip title="Move to Packaging" arrow>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleMoveToPackaging(order.orderId)}
                          >
                            <LocalShipping />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Unit Number & Remark Modal */}
        <Modal
          open={updateStatusModalOpen}
          onClose={() => setUpdateStatusModalOpen(false)}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Complete Order - Add Details
            </Typography>

            {/* Unit Number Selection */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Unit Number</InputLabel>
              <Select
                value={unitToUpdate}
                onChange={(e) => setUnitToUpdate(e.target.value)}
                label="Unit Number"
              >
                <MenuItem value="1">1</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
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
      </Box>
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
