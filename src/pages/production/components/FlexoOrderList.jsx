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
  Dialog,
  DialogActions,
  DialogContent,
  Modal,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  TablePagination,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  QrCodeScanner,
  Update,
  LocalShipping,
  Receipt,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";
import OrderService from "../../../services/wcutBagFlexoService";
import QRCodeScanner from "../../../components/QRCodeScanner";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";

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

export default function FlexoOrderList({ status = "pending", bagType }) {
  const [orders, setOrders] = useState([]);
  const [noOrdersFound, setNoOrdersFound] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false); // Ensure this state controls the scanner visibility
  const [isOpen, setOpen] = useState(false);
  const [unitToUpdate, setUnitToUpdate] = useState("");
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] =
    useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(false);
  // Row matirial list
  const [requiredMaterials, setRequiredMaterials] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [rollSize, setRollSize] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const fetchOrders = () => {
    OrderService.listOrders(status)
      .then((data) => {
        if (
          data.success &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setOrders(data.data);
          setNoOrdersFound(false);
        } else {
          setOrders([]);
          setNoOrdersFound(true);
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch orders");
        setOrders([]);
        setNoOrdersFound(true);
      })
      .finally(() => setLoading(false));
  };
  const handleVerifyOrder = async (orderId, materialId) => {
    // try {
    //   // Fetch row materials for the given order
    //   const rowMaterials = await OrderService.listMaterials(orderId);
    //   console.log("Row Materials Response:", rowMaterials);

    //   // Check if requiredMaterials is empty
    //   if (!rowMaterials.requiredMaterials || rowMaterials.requiredMaterials.length === 0) {
    //     console.log("No raw materials found, checking in_progress orders...");

    //     // Fetch active jobs in "in_progress" status
    //     const response = await OrderService.listOrders("in_progress");

    //     if (response.success && response.data.length > 0) {
    //       toast.error('A job is already active. Please complete or deactivate it before starting a new one.');
    //       return; // Exit the function
    //     }
    //   }

    // No active job, proceed with verification

    setSelectedMaterialId(materialId);
    setShowScanner(true);

    // } catch (error) {
    //   toast.error('Error checking active jobs. Please try again.');
    // }
  };

  const handleVerify = async (orderId) => {
    try {
      const response = await OrderService.listMaterials(orderId);
      console.log("Response Data:", response);
      if (response.totalQuantity === 0) {
        console.warn("No required materials found, resetting state...");
        fetchOrders(); // Refresh orders
        setSelectedOrderId(null); // Reset selected order ID
        setAddSubcategoryDialogOpen(false);
      } else {
        console.log("response data is", response);

        console.log("response.totalQuantity ", response.totalQuantity);
        // No active job, proceed with verification
        setSelectedOrderId(orderId);
        setTotalQuantity(response.totalQuantity || 0);
        setRollSize(response.rollSize || 0);
        setRequiredMaterials(response.requiredMaterials || []);

        setNoOrdersFound(response.requiredMaterials.length === 0);
        setAddSubcategoryDialogOpen(true);
      }

      // setSelectedOrderId(orderId);
      // setShowScanner(true);
    } catch (error) {
      const errorMessage =
        error?.message || "Error checking active jobs. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleRowMaterialUpdate = (open) => {
    setAddSubcategoryDialogOpen(open);
  };

  const handleScanSuccess = async (scannedData) => {
    console.log("scannedData", scannedData);
    try {
      if (!selectedOrderId) {
        toast.error("No order selected for verification");
        return;
      }
      await OrderService.verifyOrder(
        selectedOrderId,
        selectedMaterialId,
        scannedData
      );
      toast.success("Order verified successfully");
      handleVerify(selectedOrderId); // Refresh orders
      setShowScanner(false); // Close scanner dialog
    } catch (error) {
      const errorMessage = error?.message || "Failed to verify order";
      toast.error(errorMessage);
    }
  };
  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId); // Store orderId
    setUpdateStatusModalOpen(true); // Open modal
  };

  const handleStatusUpdate = () => {
    if (!unitToUpdate) {
      toast.error("Please select a unit number");
      return;
    }

    const status = "completed";
    const remarks = `Updated status after inspection with Unit ${unitToUpdate}`;

    OrderService.updateOrderStatus(
      selectedOrderId,
      status,
      remarks,
      unitToUpdate
    )
      .then(() => {
        toast.success("Order completed successfully");
        fetchOrders();
        setUpdateStatusModalOpen(false); // Close modal
        setUnitToUpdate(""); // Reset unit selection
      })
      .catch((error) => {
        toast.error("Failed to complete order");
      });
  };

  const handleMoveToBagMaking = (orderId) => {
    OrderService.moveToBagMaking(orderId)
      .then(() => {
        toast.success("Order moved to W-Cut Bag making successfully");
        fetchOrders();
      })
      .catch((error) => {
        toast.error(" Order moved to W-Cut Bag making Failed");
      });
  };

  const handleBillingClick = (order) => {
    OrderService.directBilling(order.orderId, "W-cut")
      .then(() => {
        toast.success("Order moved to billing successfully");
        fetchOrders();
      })
      .catch((error) => {
        toast.error("Failed to move to billing");
      });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      in_progress: "info",
      completed: "success",
    };
    return colors[status] || "default";
  };

  const renderActions = (order) => {
    if (bagType === "wcut") {
      if (order.flexoDetails?.[0]?.status === "pending") {
        return (
          <Button
            startIcon={<QrCodeScanner />}
            variant="outlined"
            size="small"
            onClick={() => handleVerify(order.orderId)}
          >
            Verify
          </Button>
        );
      }
      if (order.flexoDetails?.[0]?.status === "in_progress") {
        return (
          <Button
            startIcon={<Update />}
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleOpenModal(order.orderId)}
          >
            Complete
          </Button>
        );
      }
      if (order.flexoDetails?.[0]?.status === "completed") {
        return (
          <Button
            startIcon={<LocalShipping />}
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleMoveToBagMaking(order.orderId)}
          >
            Move to Bag Making
          </Button>
        );
      }
    } else {
      if (order.flexoDetails[0].status === "pending") {
        return (
          <Button
            startIcon={<QrCodeScanner />}
            variant="outlined"
            size="small"
            onClick={() => handleVerify(order.orderId)}
          >
            Verify
          </Button>
        );
      }
      if (order.flexoDetails[0].status === "in_progress") {
        return (
          <Button
            startIcon={<Update />}
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleOpenModal(order.orderId)}
          >
            Complete
          </Button>
        );
      }
      if (order.flexoDetails[0].status === "completed") {
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Direct Billing" arrow>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => handleBillingClick(order)}
              >
                <Receipt />
              </Button>
            </Tooltip>

            <Tooltip title="Move to Bag Making" arrow>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleMoveToBagMaking(order.orderId)}
              >
                <LocalShipping />
              </Button>
            </Tooltip>
          </Box>
        );
      }
    }
    return null;
  };

  const renderAddSubcategoryDialog = () => {
    const filteredMaterials = useMemo(() => {
      if (!searchTerm) return requiredMaterials;

      return requiredMaterials.filter((material) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          material.gsm.toString().toLowerCase().includes(searchLower) ||
          material.fabricColor.toLowerCase().includes(searchLower) ||
          (material.rollSize
            ? material.rollSize.toString().toLowerCase()
            : ""
          ).includes(searchLower) ||
          material.quantity.toString().toLowerCase().includes(searchLower)
        );
      });
    }, [searchTerm, requiredMaterials]);

    return (
      <Dialog
        open={addSubcategoryDialogOpen}
        onClose={() => setAddSubcategoryDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{ minHeight: "80vh" }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography>
              Raw Material - <strong>{rollSize}</strong> (Roll Size)
            </Typography>
            <Typography>
              Total Quantity In Kg: <strong>{totalQuantity}</strong>
            </Typography>
            {/* Search box */}
            <TextField
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Order ID</TableCell>
                    <TableCell>GSM</TableCell>
                    <TableCell>Fabric Color</TableCell>
                    <TableCell>Roll Size</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography>
                          No records found for this order.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material._id}>
                        <TableCell>{material._id}</TableCell>
                        <TableCell>{selectedOrderId}</TableCell>
                        <TableCell>{formatSnakeCase(material.gsm)}</TableCell>
                        <TableCell style={{ filter: "blur(5px)" }}>
                          {formatSnakeCase(material.fabricColor)}
                        </TableCell>
                        <TableCell style={{ filter: "blur(5px)" }}>
                          {formatSnakeCase(material.rollSize)}
                        </TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={formatSnakeCase(material.status)}
                            color={
                              material.status === "inactive"
                                ? "default"
                                : "success"
                            }
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() =>
                              handleVerifyOrder(selectedOrderId, material._id)
                            }
                          >
                            Scanner
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell> Roll Size</TableCell>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : noOrdersFound ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    <Typography>No records found for this status</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{formatSnakeCase(order.orderId)}</TableCell>
                    <TableCell>{formatSnakeCase(order.jobName)}</TableCell>
                    <TableCell>
                      {formatSnakeCase(
                        order.productionManagers?.[0]?.production_details
                          ?.roll_size
                      )}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails?.gsm)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails?.color)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails?.printColor)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails?.type)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.fabricQuality)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(
                        order.productionManagers?.[0]?.production_details?.type
                      )}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(order.bagDetails?.size)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(
                        order.productionManagers?.[0]?.production_details
                          ?.cylinder_size
                      )}
                    </TableCell>
                    <TableCell>{order.quantity ?? "-"}</TableCell>
                    <TableCell>
                      {order.productionManagers?.[0]?.production_details
                        ?.remarks ||
                        order.remarks ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(
                          order.flexoDetails?.[0]?.status?.replace("_", " ") ||
                            "-"
                        )}
                        color={getStatusColor(order.flexoDetails?.[0]?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{renderActions(order)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {renderAddSubcategoryDialog()}

      <Modal
        open={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Add Unit Number
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
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* QR Code Scanner Dialog */}
      <Dialog
        open={showScanner}
        onClose={() => setShowScanner(false)}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            minHeight: "600px", // Ensure enough height
            padding: "20px",
            borderRadius: "10px",
            overflow: "hidden", // Prevent unwanted scrolling
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          QR Code Verification
        </DialogTitle>
        <DialogContent sx={{ overflowY: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "150px",
            }}
          >
            <QRCodeScanner onScanSuccess={handleScanSuccess} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setShowScanner(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
