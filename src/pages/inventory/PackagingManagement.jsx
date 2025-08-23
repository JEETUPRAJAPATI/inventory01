import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Modal,
  Box,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Visibility, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import PackageService from "../../services/packageService";
import { PictureAsPdf } from "@mui/icons-material";
import QRCode from "qrcode";
import COMPANY_LOGO from "../../assets/logo.jpg";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { formatSnakeCase } from "../../utils/formatSnakeCase";
import { formatNumber } from "../../utils/numberFormatter";
const initialPackageState = {
  length: "",
  width: "",
  height: "",
  weight: "",
};
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
export default function PackagingManagement() {
  const [orders, setOrders] = useState([]); // Dynamic data from API
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const [editPackageOpen, setEditPackageOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageListOpen, setPackageListOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState(initialPackageState); // For editing package
  const [OrderPackageOpen, setOrderPackageOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [deliveryToUpdate, setDeliveryToUpdate] = useState(null); // Added to manage the delivery being updated
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unitNumbers, setUnitNumbers] = useState({});
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Fetch orders from the service
  const fetchOrders = async () => {
    try {
      const orders = await PackageService.fetchOrders();
      console.log("orders", orders.data);
      setOrders(orders.data);
    } catch (error) {
      toast.error("Failed to fetch orders.");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders(); // Fetch orders on mount
  }, []);

  // Filtered and searched orders
  const filteredOrders = orders
    .filter((order) => {
      const customerName = order?.order?.customerName || ""; // Ensure safe access
      const jobName = order?.order?.jobName || ""; // Ensure safe access
      const orderId = order?.order_id?.toString() || ""; // Convert number to string safely
      return (
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((order) => (statusFilter ? order?.status === statusFilter : true));

  const handleStatusUpdateClick = (delivery) => {
    setDeliveryToUpdate(delivery); // Set the delivery to be updated
    setStatusToUpdate(delivery.status); // Set the current status to preselect the right option
    setUpdateStatusModalOpen(true); // Open the modal
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle updating the delivery status
  const handleStatusUpdate = async () => {
    if (!deliveryToUpdate) return; // Prevent update if no delivery is selected

    // Log the data before making the API call
    console.log("Updating delivery with ID:", deliveryToUpdate._id);
    console.log("New status:", statusToUpdate);

    try {
      // Make the API call
      await PackageService.updateDeliveryStatus(
        deliveryToUpdate._id,
        statusToUpdate
      );
      toast.success(`Package status updated to ${statusToUpdate}`);
      fetchOrders(); // Refresh the list after the update
      setUpdateStatusModalOpen(false); // Close the modal after successful update
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  // Handle order selection
  const handleOrderChange = (e) => {
    const selectedOrderId = e.target.value; // Get the selected orderId
    console.log(selectedOrderId);
    const order = orders.find((o) => o.order_id === selectedOrderId); // Match with order_id
    setSelectedOrder(order); // Set the selected order

    if (order) {
      setPackages({
        ...packages,
        [selectedOrderId]: [{ ...initialPackageState }],
      });
    }
  };

  // Add new package to the selected order
  const handleAddPackage = () => {
    if (!selectedOrder) return;
    setPackages({
      ...packages,
      [selectedOrder.order_id]: [
        ...(packages[selectedOrder.order_id] || []), // Ensure packages exist for the order
        { ...initialPackageState },
      ],
    });
  };

  const handlePackageChange = (orderId, index, field, value) => {
    const updatedPackages = [...packages[orderId]];
    updatedPackages[index][field] = value;
    setPackages({
      ...packages,
      [orderId]: updatedPackages,
    });
  };
  // Save packages using the service
  const handleSavePackages = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order.");
      return;
    }

    try {
      const payload = {
        order_id: selectedOrder.order_id, // Use the correct field for order_id
        package_details: packages[selectedOrder.order_id].map((pkg) => ({
          length: parseFloat(pkg.length),
          width: parseFloat(pkg.width),
          height: parseFloat(pkg.height),
          weight: parseFloat(pkg.weight),
        })),
      };

      await PackageService.addPackage(payload);
      toast.success("Packages saved successfully");
      handleCancel();
    } catch (error) {
      toast.error("Failed to save packages.");
      console.error("Error saving packages:", error);
    }
  };

  // Handle order view and fetching packages
  const handleViewPackages = async (order) => {
    setSelectedOrder(order);
    setPackageListOpen(true);

    try {
      const { packages, unitNumbers } =
        await PackageService.fetchPackagesByOrderId(order.order_id); // Ensure the API call uses the correct field
      console.log("Fetched order packages:", packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  // Handle package editing
  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setNewPackage({
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      weight: pkg.weight,
    });
    setEditPackageOpen(true);
  };
  // Handle package delete

  const handleDeletePackage = (index) => {
    const updatedPackages = packages[selectedOrder.order_id].filter(
      (pkg, i) => i !== index
    );
    setPackages({ ...packages, [selectedOrder.order_id]: updatedPackages });
  };
  const handleUpdatePackage = async () => {
    if (!selectedPackage || !selectedOrder) {
      toast.error("Please select a package and order to edit.");
      return;
    }

    const updatedPackage = {
      ...selectedPackage,
      length: newPackage.length,
      width: newPackage.width,
      height: newPackage.height,
      weight: newPackage.weight,
    };

    // Update local state
    const updatedPackages = packages.map((pkg) =>
      pkg._id === selectedPackage._id ? updatedPackage : pkg
    );
    setPackages(updatedPackages);

    try {
      await PackageService.updatePackage(
        selectedOrder.order_id,
        selectedPackage._id,
        updatedPackage
      );
      const { packages, unitNumbers } =
        await PackageService.fetchPackagesByOrderId(selectedOrder.order_id);
      console.log("Refresh Data Fetched order list", packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});
      fetchOrders();
      toast.success("Package updated successfully");
      setEditPackageOpen(false);
    } catch (error) {
      toast.error("Failed to update package.");
      console.error("Error updating package:", error);
    }
  };
  // Create new package for the selected order
  const createPackages = async () => {
    console.log("new package data", newPackage);
    console.log("order id", selectedOrder.order_id);

    // Prepare the payload to include the orderId and new package data
    const payload = {
      order_id: selectedOrder.order_id, // Correct order_id usage
      package_details: [
        {
          length: parseFloat(newPackage.length),
          width: parseFloat(newPackage.width),
          height: parseFloat(newPackage.height),
          weight: parseFloat(newPackage.weight),
        },
      ],
    };
    console.log("payload", payload);
    try {
      // Call the service method with the prepared payload
      const response = await PackageService.createPackage(payload);
      console.log("Package added successfully:", response);
      const { packages, unitNumbers } =
        await PackageService.fetchPackagesByOrderId(selectedOrder.order_id);
      console.log("Refresh Data Fetched order list", packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});
      fetchOrders();
      handleCloseDialog(); // Close the dialog on success
    } catch (error) {
      console.error("Failed to add package:", error);
      toast.error(`Failed to add package: ${error.message || "Unknown error"}`);
    }
  };

  const handleCloseDialog = () => {
    setOrderPackageOpen(false);
    setNewPackage({
      length: "",
      width: "",
      height: "",
      weight: "",
    });
  };
  const handleOpenDialog = () => {
    setOrderPackageOpen(true);
  };

  const handleCancel = () => {
    setSelectedOrder(null);
    setPackages({});
    setAddPackageOpen(false);
    setEditPackageOpen(false);
  };
  const generatePackageAllDetails = async (order) => {
    if (!order) {
      toast.error("Invalid order data");
      return;
    }

    try {
      // Fetch package details
      const { packages, unitNumbers } =
        await PackageService.fetchPackagesByOrderId(order.order_id);
      if (!packages || packages.length === 0) {
        toast.error("No packages found for this order");
        return;
      }

      // Loop through each package and generate label
      packages.forEach((pkg) => {
        generatePackageLabel(pkg, order, unitNumbers);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating order PDF");
    }
  };

  const generatePackageLabel = async (pkg, salesOrder, unitNumbers) => {
    return new Promise(async (resolve) => {
      if (!pkg || !salesOrder || !salesOrder.order) return resolve();

      const order = salesOrder.order;
      const bagDetails = order.bagDetails || {};

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [76.2, 127], // 3" x 5"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let margin = 3.5;
      let currentY = 2; // 2px padding from top

      // -------- HEADER --------
      const logoSize = 10; // smaller logo
      doc.addImage(
        COMPANY_LOGO,
        "PNG",
        (pageWidth - logoSize) / 2,
        currentY,
        logoSize,
        logoSize
      );
      currentY += logoSize + 4; // 2px padding below

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("THAILIWALE INDUSTRIES PVT. LTD.", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(
        "201/1/4, SR Compound, Lasudiya Mori, Indore",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 3;
      doc.text(
        "Mob.: +91 8989788532, Email: info@thailiwale.com",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 4;

      // -------- TABLE (All details in one table) --------
      const tableData = [
        ["Order ID", order.orderId],
        ["Package ID", pkg._id],
        ["Job Name", order.jobName],
        ["Customer Name", order.customerName],
        ["Address", order.address],
        ["Fabric Quality", order.fabricQuality],
        ["GSM", bagDetails.gsm || "N/A"],
        ["Bag Type", formatSnakeCase(bagDetails.type) || "N/A"],
        ["Bag Colour", bagDetails.color || "N/A"],
        ["Bag Size", bagDetails.size || `${pkg.length}x${pkg.width}`],
        ["Print Colour", bagDetails.printColor || "N/A"],
        ["Flexo Unit No", unitNumbers?.flexo || "N/A"],
        ["Bag Making Unit No", unitNumbers?.wcut || "N/A"],
        ["Net Weight", `${formatNumber(pkg.weight || 0)} kg`],
        ["Total Packages", Array.isArray(pkg) ? pkg.length : 1],
      ];

      autoTable(doc, {
        startY: currentY,
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 6,
          cellPadding: { top: 1, right: 2, bottom: 1, left: 2 },
          lineHeight: 1,
          halign: "left", // all align left
          valign: "middle",
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 30 }, // label column
          1: { halign: "left" }, // value column left aligned
        },
        tableWidth: pageWidth - margin * 2,
        margin: { left: margin, right: margin },
      });

      currentY = doc.lastAutoTable.finalY + 2;

      // -------- QR CODE --------
      const qrCanvas = document.createElement("canvas");
      const qrText = `Order ID: ${order.orderId}\nPackage ID: ${pkg._id}\nWeight: ${formatNumber(pkg.weight || 0)} kg`;

      await QRCode.toCanvas(qrCanvas, qrText, { width: 70 });
      const qrDataUrl = qrCanvas.toDataURL("image/png");

      const qrSize = 22; // slightly smaller to fit
      const qrX = (pageWidth - qrSize) / 2;
      doc.addImage(qrDataUrl, "PNG", qrX, currentY, qrSize, qrSize);

      // -------- SAVE --------
      doc.save(`Label_${order.orderId}_${pkg._id}.pdf`);
      resolve();
    });
  };

  // const generatePackageLabel = async (pkg, salesOrder, unitNumbers) => {
  //   return new Promise(async (resolve) => {
  //     if (!pkg || !salesOrder || !salesOrder.order) {
  //       toast.error("Invalid package or sales order data");
  //       return resolve();
  //     }
  //     // console.log('pkg', pkg);
  //     // console.log('salesOrder', salesOrder);
  //     // console.log('unitNumbers', unitNumbers);
  //     // return false;
  //     const order = salesOrder.order;
  //     const bagDetails = order.bagDetails || {};

  //     const generateQRCode = async () => {
  //       return new Promise((resolve) => {
  //         const canvas = document.createElement("canvas");
  //         const qrText = `Order ID: ${order.orderId}\nPackage ID: ${pkg._id}\nWeight: ${pkg.weight} kg`;
  //         QRCode.toCanvas(canvas, qrText, { width: 80, margin: 1 }, (error) => {
  //           resolve(error ? null : canvas.toDataURL("image/png"));
  //         });
  //       });
  //     };

  //     // Custom PDF size: width 140mm x height 180mm
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: [180, 200],
  //     });

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const margin = 10;
  //     let currentY = 10;
  //     const marginLeft = 14;

  //     const textX = marginLeft + 90;

  //     // Header
  //     const logoSize = 20;
  //     doc.addImage(COMPANY_LOGO, "PNG", margin, currentY, logoSize, logoSize);
  //     doc.setFontSize(14);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(
  //       "Thailiwale Industries Private Limited",
  //       margin + logoSize + 5,
  //       currentY + 10
  //     );
  //     currentY += logoSize + 8;
  //     // Address (properly spaced)
  //     doc.setFontSize(10);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(
  //       "201/1/4, SR Compound, Lasudiya Mori, Lasudia, Indore 453771",
  //       textX,
  //       currentY + 12
  //     );
  //     doc.text("Email: info@thailiwale.com", textX, currentY + 19);
  //     doc.text("Phone: +917999857050, +918989788532", textX, currentY + 26);

  //     // Divider
  //     doc.setDrawColor(180);
  //     doc.line(margin, currentY, pageWidth - margin, currentY);
  //     currentY += 6;

  //     // Two Column Data
  //     const leftColumn = [
  //       ["Order ID", order.orderId],
  //       ["Package ID", pkg._id],
  //       ["Flexo Unit No.", unitNumbers?.flexo || "N/A"],
  //       ["Bag Size", bagDetails.size || `${pkg.length}x${pkg.width} cm`],
  //       ["Print Colour", bagDetails.printColor || "N/A"],
  //     ];

  //     const rightColumn = [
  //       ["GSM", bagDetails.gsm || "N/A"],
  //       ["Bag Colour", bagDetails.color || "N/A"],
  //       ["Bag Type", bagDetails.type || "N/A"],
  //       ["Net Weight", `${pkg.weight} kg`],
  //       ["Bag Making Unit No.", unitNumbers?.wcut || "N/A"],
  //     ];

  //     const leftX = margin;
  //     const rightX = pageWidth / 2 + 2;
  //     const rowHeight = 9;
  //     doc.setFontSize(10);

  //     for (let i = 0; i < leftColumn.length; i++) {
  //       // Left
  //       doc.setFont("helvetica", "bold");
  //       doc.text(`${leftColumn[i][0]}:`, leftX, currentY);
  //       doc.setFont("helvetica", "normal");
  //       doc.text(leftColumn[i][1] || "N/A", leftX + 30, currentY);

  //       // Right
  //       if (rightColumn[i]) {
  //         doc.setFont("helvetica", "bold");
  //         doc.text(`${rightColumn[i][0]}:`, rightX, currentY);
  //         doc.setFont("helvetica", "normal");

  //         doc.text(String(rightColumn[i][1]) || "N/A", rightX + 40, currentY);
  //       }

  //       currentY += rowHeight;
  //     }
  //     console.log(Array.isArray(pkg)); // true if it's an array

  //     currentY += 6;
  //     doc.line(margin, currentY, pageWidth - margin, currentY);
  //     currentY += 8;

  //     // Job & Customer Info
  //     const addField = (label, value) => {
  //       doc.setFont("helvetica", "bold");
  //       doc.text(`${label}:`, margin, currentY);
  //       doc.setFont("helvetica", "normal");
  //       const lines = doc.splitTextToSize(
  //         value || "N/A",
  //         pageWidth - margin * 2 - 30
  //       );
  //       doc.text(lines, margin + 30, currentY);
  //       currentY += lines.length * 6;
  //     };

  //     addField("Job Name", order.jobName);
  //     addField("Customer Name", order.customerName);
  //     addField("Fabric Quality", order.fabricQuality);
  //     addField("Address", order.address);
  //     const totalPackages = Array.isArray(pkg) ? pkg.length : 1;
  //     addField("Total Packages", totalPackages);

  //     currentY += 5;
  //     // QR Code
  //     const qrCode = await generateQRCode();
  //     if (qrCode) {
  //       const qrSize = 50;
  //       const qrX = (pageWidth - qrSize) / 2;
  //       doc.addImage(qrCode, "PNG", qrX, currentY, qrSize, qrSize);
  //       doc.setFontSize(8);
  //       doc.text("Scan for details", qrX + qrSize / 2, currentY + qrSize + 6, {
  //         align: "center",
  //       });
  //     }

  //     // Save
  //     doc.save(`Label_${order.orderId}_${pkg._id}.pdf`);
  //     toast.success("Package label generated!");
  //     resolve();
  //   });
  // };

  return (
    <>
      <Card>
        <Box sx={{ p: 3 }}>
          <div className="flex justify-between items-center p-4">
            <Typography variant="h6">Package Management</Typography>
            <div className="flex gap-3">
              {/* Search Box */}
              <TextField
                label="Search Orders"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddPackageOpen(true)}
              >
                Add Package
              </Button>
            </div>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>

                  <TableCell>Bag Type</TableCell>
                  <TableCell>Job Name</TableCell>
                  <TableCell
                    sx={{
                      width: "180px",
                    }}
                  >
                    Number of Packages
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "120px",
                    }}
                  >
                    Bag Size
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "120px",
                    }}
                  >
                    Weight (kg)
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell
                    sx={{
                      width: "120px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Use filteredOrders
                    .map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order?.order_id || "N/A"}</TableCell>
                        <TableCell>
                          {formatSnakeCase(order?.order?.customerName) || "N/A"}
                        </TableCell>

                        <TableCell>
                          {formatSnakeCase(order?.order?.bagDetails?.type)}
                        </TableCell>
                        <TableCell>
                          {formatSnakeCase(order?.order?.jobName) || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                          }}
                        >
                          {order?.package_details?.length || 0}
                        </TableCell>

                        <TableCell>
                          {order?.order?.bagDetails?.size || "N/A"}
                        </TableCell>
                        <TableCell>{formatNumber(parseFloat(order?.totalWeight || 0))}</TableCell>
                        <TableCell>
                          <Chip
                            label={formatSnakeCase(order.status)}
                            color={
                              order.status === "pending"
                                ? "warning"
                                : order.status === "delivery"
                                ? "success"
                                : order.status === "cancelled"
                                ? "error"
                                : "default" // fallback color
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleStatusUpdateClick(order)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleViewPackages(order)}
                          >
                            <Visibility />
                          </IconButton>
                          {/* <IconButton
                          color="primary"
                          onClick={() => generatePackageAllDetails(order)}
                        >
                          <PictureAsPdf />
                        </IconButton> */}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

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

      <Dialog
        open={packageListOpen}
        onClose={() => {
          setPackageListOpen(false);
          setSelectedOrder(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Packages for Order {selectedOrder?.id}</DialogTitle>
        <TableCell>
          <Button size="small" variant="outlined" onClick={handleOpenDialog}>
            Add New Packages
          </Button>
        </TableCell>

        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Package ID</TableCell>
                  <TableCell>Length (cm)</TableCell>
                  <TableCell>Width (cm)</TableCell>
                  <TableCell>Height (cm)</TableCell>
                  <TableCell>Weight (kg)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.length > 0 &&
                  packages.map((pkg) =>
                    pkg.package_details.map((pkgDetail) => (
                      <TableRow key={pkgDetail._id}>
                        <TableCell>{pkgDetail._id}</TableCell>
                        <TableCell>{formatNumber(parseFloat(pkgDetail.length || 0))}</TableCell>
                        <TableCell>{formatNumber(parseFloat(pkgDetail.width || 0))}</TableCell>
                        <TableCell>{formatNumber(parseFloat(pkgDetail.height || 0))}</TableCell>
                        <TableCell>{formatNumber(parseFloat(pkgDetail.weight || 0))}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditPackage(pkgDetail)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() =>
                              generatePackageLabel(
                                pkgDetail,
                                selectedOrder,
                                unitNumbers
                              )
                            }
                          >
                            <PictureAsPdf />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setPackageListOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Modal */}
      <Modal
        open={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)} // Close modal on backdrop click
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Update Packaging Status
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value)} // Handle selection change
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="delivery">Delivery</MenuItem>
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

      {/* Add Package Dimensions Dialog */}
      <Dialog open={OrderPackageOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Package Dimensions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Length (cm)"
                type="number"
                value={newPackage.length}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, length: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                type="number"
                value={newPackage.width}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, width: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (cm)"
                type="number"
                value={newPackage.height}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, height: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={newPackage.weight}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, weight: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={createPackages}>
            Add Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Package Dimensions */}
      <Dialog open={editPackageOpen} onClose={() => setEditPackageOpen(false)}>
        <DialogTitle>Edit Package Dimensions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Length (cm)"
                type="number"
                value={newPackage.length}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, length: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                type="number"
                value={newPackage.width}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, width: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (cm)"
                type="number"
                value={newPackage.height}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, height: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={newPackage.weight}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, weight: formatNumber(parseFloat(e.target.value || 0)) })
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setEditPackageOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePackage}>
            Update Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Package Modal */}
      <Dialog
        open={addPackageOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Packages</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Order Selection */}
            <Grid item xs={12}>
              <TextField
                select
                // label="Select Order"
                fullWidth
                value={selectedOrder?.order_id || ""} // Make sure it matches 'order_id'
                onChange={handleOrderChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select an order</option>
                {orders.map(
                  (order) =>
                    order.order && ( // Check if 'order' exists
                      <option key={order._id} value={order.order_id}>
                        {order.order_id} - {order.order.customerName}
                      </option>
                    )
                )}
              </TextField>
            </Grid>

            {/* Selected Order Details */}
            {selectedOrder && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Order Details
                  </Typography>
                  <Typography variant="body2">
                    Customer: {selectedOrder?.order?.customerName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Dimensions: {selectedOrder?.order?.totalDimensions || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Weight: {formatNumber(parseFloat(selectedOrder?.totalWeight || 0))} kg
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Package List for Selected Order */}
            {selectedOrder &&
              packages[selectedOrder.order_id] &&
              packages[selectedOrder.order_id].map((pkg, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ border: "1px solid #ddd", p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid
                        item
                        xs={12}
                        sx={{
                          justifyContent: "space-between",
                          display: "flex",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Package {index + 1}
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeletePackage(index)}
                        >
                          <Delete />
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Length (cm)"
                          value={pkg.length}
                          onChange={(e) =>
                            handlePackageChange(
                              selectedOrder.order_id,
                              index,
                              "length",
                              formatNumber(parseFloat(e.target.value || 0))
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Width (cm)"
                          value={pkg.width}
                          onChange={(e) =>
                            handlePackageChange(
                              selectedOrder.order_id,
                              index,
                              "width",
                              formatNumber(parseFloat(e.target.value || 0))
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Height (cm)"
                          value={pkg.height}
                          onChange={(e) =>
                            handlePackageChange(
                              selectedOrder.order_id,
                              index,
                              "height",
                              formatNumber(parseFloat(e.target.value || 0))
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Weight (kg)"
                          value={pkg.weight}
                          onChange={(e) =>
                            handlePackageChange(
                              selectedOrder.order_id,
                              index,
                              "weight",
                              formatNumber(parseFloat(e.target.value || 0))
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}

            {/* Add New Package Button */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                sx={{ py: 1 }}
                onClick={handleAddPackage}
                fullWidth
              >
                Add Another Package
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePackages}>
            Save Packages
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}