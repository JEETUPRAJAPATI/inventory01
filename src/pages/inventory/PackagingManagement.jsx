import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import toast from 'react-hot-toast';
import PackageService from '../../services/packageService';
import { PictureAsPdf } from '@mui/icons-material';

import COMPANY_LOGO from '../../assets/logo.jpg';
import { jsPDF } from 'jspdf';
import JsBarcode from "jsbarcode";
const initialPackageState = {
  length: '',
  width: '',
  height: '',
  weight: ''
};
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
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
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [deliveryToUpdate, setDeliveryToUpdate] = useState(null); // Added to manage the delivery being updated
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [unitNumbers, setUnitNumbers] = useState({});
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Fetch orders from the service
  const fetchOrders = async () => {
    try {
      const orders = await PackageService.fetchOrders();
      console.log('orders', orders.data);
      setOrders(orders.data);
    } catch (error) {
      toast.error('Failed to fetch orders.');
      console.error('Error fetching orders:', error);
    }
  };
  useEffect(() => {
    fetchOrders(); // Fetch orders on mount
  }, []);


  // Filtered and searched orders
  const filteredOrders = orders
    .filter(order => {
      const customerName = order?.order?.customerName || ""; // Ensure safe access
      const orderId = order?.order_id?.toString() || ""; // Convert number to string safely
      return (
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter(order => (statusFilter ? order?.status === statusFilter : true));

  const handleStatusUpdateClick = (delivery) => {
    setDeliveryToUpdate(delivery); // Set the delivery to be updated
    setStatusToUpdate(delivery.status); // Set the current status to preselect the right option
    setUpdateStatusModalOpen(true); // Open the modal
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
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
      await PackageService.updateDeliveryStatus(deliveryToUpdate._id, statusToUpdate);
      toast.success(`Package status updated to ${statusToUpdate}`);
      fetchOrders(); // Refresh the list after the update
      setUpdateStatusModalOpen(false); // Close the modal after successful update
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred");
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
        ...(packages[selectedOrder.order_id] || []),  // Ensure packages exist for the order
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
      toast.error('Please select an order.');
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
      toast.success('Packages saved successfully');
      handleCancel();
    } catch (error) {
      toast.error('Failed to save packages.');
      console.error('Error saving packages:', error);
    }
  };



  // Handle order view and fetching packages
  const handleViewPackages = async (order) => {
    console.log('order view', order);
    setSelectedOrder(order);
    setPackageListOpen(true);

    try {
      const { packages, unitNumbers } = await PackageService.fetchPackagesByOrderId(order.order_id); // Ensure the API call uses the correct field
      console.log('Fetched order packages:', packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});

    } catch (error) {
      console.error('Error fetching packages:', error);
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


  const handleUpdatePackage = async () => {
    if (!selectedPackage || !selectedOrder) {
      toast.error('Please select a package and order to edit.');
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
    const updatedPackages = packages.map(pkg =>
      pkg._id === selectedPackage._id ? updatedPackage : pkg
    );
    setPackages(updatedPackages);

    try {
      await PackageService.updatePackage(selectedOrder.order_id, selectedPackage._id, updatedPackage);
      const { packages, unitNumbers } = await PackageService.fetchPackagesByOrderId(selectedOrder.order_id);
      console.log('Refresh Data Fetched order list', packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});
      fetchOrders();
      toast.success('Package updated successfully');
      setEditPackageOpen(false);
    } catch (error) {
      toast.error('Failed to update package.');
      console.error('Error updating package:', error);
    }
  };
  // Create new package for the selected order
  const createPackages = async () => {
    console.log('new package data', newPackage);
    console.log('order id', selectedOrder.order_id);

    // Prepare the payload to include the orderId and new package data
    const payload = {
      order_id: selectedOrder.order_id, // Correct order_id usage
      package_details: [{
        length: parseFloat(newPackage.length),
        width: parseFloat(newPackage.width),
        height: parseFloat(newPackage.height),
        weight: parseFloat(newPackage.weight),
      }],
    };
    console.log('payload', payload);
    try {
      // Call the service method with the prepared payload
      const response = await PackageService.createPackage(payload);
      console.log('Package added successfully:', response);
      const { packages, unitNumbers } = await PackageService.fetchPackagesByOrderId(selectedOrder.order_id);
      console.log('Refresh Data Fetched order list', packages);
      setPackages(packages || []);
      setUnitNumbers(unitNumbers || {});
      fetchOrders();
      handleCloseDialog();  // Close the dialog on success
    } catch (error) {
      console.error('Failed to add package:', error);
      alert(`Failed to add package: ${error.message || 'Unknown error'}`);
    }
  };


  const handleCloseDialog = () => {
    setOrderPackageOpen(false);
    setNewPackage({
      length: '',
      width: '',
      height: '',
      weight: ''
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
      const { packages, unitNumbers } = await PackageService.fetchPackagesByOrderId(order.order_id);
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
      console.log("Package Data:", pkg);
      console.log("Sales Order:", salesOrder);

      if (!pkg || !salesOrder) {
        toast.error("Invalid package or sales order data");
        return resolve();
      }

      const doc = new jsPDF();
      const marginLeft = 20;
      const topMargin = 10;
      const lineHeight = 12;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Function to load image as base64
      const loadImageAsBase64 = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };


      const generateBarcode = async (packages, order) => {


        console.log('packages', packages)
        return new Promise((resolve, reject) => {
          if (!order || !packages) return resolve(null);

          const canvas = document.createElement("canvas");

          try {
            let barcodeData = `OrderId:${order.orderId}|JobName:${order.jobName}|CustomerName:${order.customerName}|BagColor:${order.bagDetails.color}`;

            // If there are multiple packages, include package details
            if (packages.package_details && packages.package_details.length > 0) {
              const packageDetails = packages.package_details.map(pkg =>
                `L:${pkg.length}, W:${pkg.width}, H:${pkg.height}, WT:${pkg.weight}`
              ).join(" | ");
              barcodeData += ` | ${packageDetails}`;
            } else {
              const packageDetails = `L:${packages.length}, W:${packages.width}, H:${packages.height}, WT:${packages.weight}`;
              barcodeData += ` | ${packageDetails}`;
            }


            console.log('barcodeData', barcodeData)

            // Generate barcode
            JsBarcode(canvas, barcodeData, {
              format: "CODE128",
              width: 3,
              height: 80,
              displayValue: true,
              fontSize: 16,
              margin: 15,
              background: "#FFFFFF",
              lineColor: "#000000"
            });

            // Convert barcode to PNG image
            resolve(canvas.toDataURL("image/png"));
          } catch (error) {
            console.error("Barcode generation error:", error);
            reject(error);
          }
        });
      };





      // Load images and barcode
      const logoBase64 = await loadImageAsBase64(COMPANY_LOGO);
      const barcodeBase64 = await generateBarcode(pkg, salesOrder.order);


      let currentY = topMargin;

      if (logoBase64) doc.addImage(logoBase64, "PNG", marginLeft, currentY, 50, 25);

      doc.setFontSize(12);
      doc.text("Company Name", pageWidth - 90, currentY + 5);
      doc.text("Address: 123 Business Street, City", pageWidth - 90, currentY + 15);
      doc.text("GSM Email: info@company.com", pageWidth - 90, currentY + 25);
      doc.text("Phone: +1-234-567-890", pageWidth - 90, currentY + 35);

      currentY += 45;
      doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
      currentY += 10;

      // Order Details
      const order = salesOrder.order || {};
      const bagDetails = order.bagDetails || {};

      doc.text(`Order ID    : ${order.orderId || "N/A"}`, marginLeft, currentY);
      doc.text(`Customer   : ${order.customerName || "N/A"}`, marginLeft, currentY + lineHeight);
      doc.text(`Email      : ${order.email || "N/A"}`, marginLeft, currentY + lineHeight * 2);
      doc.text(`Mobile     : ${order.mobileNumber || "N/A"}`, marginLeft, currentY + lineHeight * 3);
      doc.text(`Address    : ${order.address || "N/A"}`, marginLeft, currentY + lineHeight * 4);
      doc.text(`Job Name   : ${order.jobName || "N/A"}`, marginLeft, currentY + lineHeight * 5);

      currentY += lineHeight * 6;

      // Package Details
      doc.text(`TYPE OF FABRIC : ${bagDetails.type || "N/A"}`, marginLeft, currentY);
      doc.text(`COLOR       : ${bagDetails.color || "N/A"}`, marginLeft, currentY + lineHeight);
      doc.text(`GSM         : ${bagDetails.gsm || "N/A"}`, pageWidth / 2, currentY);
      currentY += lineHeight * 2;

      // Unit Numbers
      doc.setFontSize(11);
      Object.entries(unitNumbers).forEach(([key, value]) => {
        if (value !== "N/A") {
          doc.text(`${key.toUpperCase()} UNIT No. : ${value}`, marginLeft, currentY);
          currentY += lineHeight;
        }
      });
      currentY += 10;

      // Package Table
      const headers = [["#", "Length (cm)", "Width (cm)", "Height (cm)", "Weight (kg)"]];
      const packageData = pkg.package_details || [pkg];
      const data = packageData.map((item, index) => [
        index + 1,
        item.length || "N/A",
        item.width || "N/A",
        item.height || "N/A",
        item.weight || "N/A",
      ]);

      doc.autoTable({
        startY: currentY,
        head: headers,
        body: data,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: marginLeft, right: 20 },
      });
      currentY = doc.autoTable.previous.finalY + 20;
      if (barcodeBase64) {
        currentY += 5; // Add space before barcode
        doc.addImage(barcodeBase64, "PNG", marginLeft, currentY, 180, 60); // Proper size for better scanning
        currentY += 60; // Move below barcode
        doc.text("", marginLeft, currentY); // Empty text to maintain spacing
      }
      // Save PDF
      doc.save(`package-label-${pkg._id}.pdf`);
      toast.success(`Package label downloaded: ${pkg._id}`);
      resolve();
    });
  };



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
                <MenuItem value="delivery">Delivery</MenuItem>
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
                  <TableCell>Bag Size</TableCell>
                  <TableCell>Weight (kg)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Use filteredOrders
                  .map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order?.order_id || 'N/A'}</TableCell>
                      <TableCell>{order?.order?.customerName || 'N/A'}</TableCell>
                      <TableCell>
                        {order?.order?.bagDetails?.size || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {order?.totalWeight || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={
                            order.status === 'pending'
                              ? 'warning'
                              : order.status === 'delivery'
                                ? 'success'
                                : order.status === 'cancelled'
                                  ? 'error'
                                  : 'default' // fallback color
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
                        <IconButton
                          color="primary"
                          onClick={() => generatePackageAllDetails(order)}
                        >
                          <PictureAsPdf />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
        onClose={() => setPackageListOpen(false)}
        maxWidth="md"
        fullWidth
      >

        <DialogTitle>
          Packages for Order {selectedOrder?.id}

        </DialogTitle>
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
                {packages.length > 0 ? (
                  packages.map((pkg) =>
                    pkg.package_details.map((pkgDetail) => (
                      <TableRow key={pkgDetail._id}>
                        <TableCell>{pkgDetail._id}</TableCell>
                        <TableCell>{pkgDetail.length}</TableCell>
                        <TableCell>{pkgDetail.width}</TableCell>
                        <TableCell>{pkgDetail.height}</TableCell>
                        <TableCell>{pkgDetail.weight}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditPackage(pkgDetail)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => generatePackageLabel(pkgDetail, selectedOrder, unitNumbers)}
                          >
                            <PictureAsPdf />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>No packages found</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
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
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setUpdateStatusModalOpen(false)} sx={{ mr: 1 }}>
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
                onChange={(e) => setNewPackage({ ...newPackage, length: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                type="number"
                value={newPackage.width}
                onChange={(e) => setNewPackage({ ...newPackage, width: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (cm)"
                type="number"
                value={newPackage.height}
                onChange={(e) => setNewPackage({ ...newPackage, height: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={newPackage.weight}
                onChange={(e) => setNewPackage({ ...newPackage, weight: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={createPackages}>
            Add Package
          </Button>
        </DialogActions>
      </Dialog>


      { /* Edit Package Dimensions */}
      <Dialog
        open={editPackageOpen}
        onClose={() => setEditPackageOpen(false)}
      >
        <DialogTitle>Edit Package Dimensions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Length (cm)"
                type="number"
                value={newPackage.length}
                onChange={(e) => setNewPackage({ ...newPackage, length: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                type="number"
                value={newPackage.width}
                onChange={(e) => setNewPackage({ ...newPackage, width: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (cm)"
                type="number"
                value={newPackage.height}
                onChange={(e) => setNewPackage({ ...newPackage, height: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={newPackage.weight}
                onChange={(e) => setNewPackage({ ...newPackage, weight: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPackageOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePackage}>Update Package</Button>
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
                label="Select Order"
                fullWidth
                value={selectedOrder?.order_id || ''}  // Make sure it matches 'order_id'
                onChange={handleOrderChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select an order</option>
                {orders.map((order) => (
                  order.order && (  // Check if 'order' exists
                    <option key={order._id} value={order.order_id}>
                      {order.order_id} - {order.order.customerName}
                    </option>
                  )
                ))}
              </TextField>
            </Grid>

            {/* Selected Order Details */}
            {selectedOrder && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Order Details
                  </Typography>
                  <Typography variant="body2">Customer: {selectedOrder?.order?.customerName || 'N/A'}</Typography>
                  <Typography variant="body2">Dimensions: {selectedOrder?.order?.totalDimensions || 'N/A'}</Typography>
                  <Typography variant="body2">Weight: {selectedOrder?.totalWeight || 'N/A'} kg</Typography>

                </Box>
              </Grid>
            )}

            {/* Package List for Selected Order */}
            {selectedOrder && packages[selectedOrder.order_id] && packages[selectedOrder.order_id].map((pkg, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Package {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Length (cm)"
                        value={pkg.length}
                        onChange={(e) => handlePackageChange(selectedOrder.order_id, index, 'length', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Width (cm)"
                        value={pkg.width}
                        onChange={(e) => handlePackageChange(selectedOrder.order_id, index, 'width', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Height (cm)"
                        value={pkg.height}
                        onChange={(e) => handlePackageChange(selectedOrder.order_id, index, 'height', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Weight (kg)"
                        value={pkg.weight}
                        onChange={(e) => handlePackageChange(selectedOrder.order_id, index, 'weight', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}

            {/* Add New Package Button */}
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleAddPackage} fullWidth>
                Add Another Package
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePackages}>
            Save Packages
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
