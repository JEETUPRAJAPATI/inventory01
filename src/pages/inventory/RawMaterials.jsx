import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  TablePagination,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  GetApp,
  QrCode,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";

import orderService from "/src/services/orderService.js";
import FormSelect from "../../components/common/FormSelect";
import authService from "../../services/authService";
import QRCodeDialog from "../../components/sales/orders/QRCodeDialog";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from "qrcode";
import COMPANY_LOGO from "../../assets/logo.jpg";
import { formatSnakeCase } from "../../utils/formatSnakeCase";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
const categoryOptions = [
  { value: "fabric", label: "Fabric" },
  { value: "handle", label: "Handle" },
  { value: "thread", label: "Thread" },
  { value: "dye", label: "Dye" },
];

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

export default function RawMaterials() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewSubcategoriesOpen, setViewSubcategoriesOpen] = useState(false);
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] =
    useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [updateQuantityModalOpen, setUpdateQuantityModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unitToUpdate, setQuantityToUpdate] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bagAttributes, setBagAttributes] = useState({
    "bag-color": [],
    "fabric-quality": [],
    gsm: [],
    size: [],
    "handle-color": [],
    "roll-size": [],
  });

  const [newCategory, setNewCategory] = useState({
    category: "",
    fabricColor: "",
    rollSize: "",
    gsm: "",
    fabricQuality: "",
    quantity: "",
  });
  const [newSubcategory, setNewSubcategory] = useState({
    fabricColor: "",
    rollSize: "",
    gsm: "",
    fabricQuality: "",
    quantity: "",
  });

  //  Add Category

  // quantity_kgs: newCategory.quantity,
  const handleAddCategory = async () => {
    console.log("calling api");
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      const response = await axios.post(
        `${API_BASE_URL}/inventory/raw-material`,
        {
          category_name: newCategory.category,
          fabric_quality: newCategory.fabricQuality,
          roll_size: newCategory.rollSize,
          gsm: newCategory.gsm,
          fabric_color: newCategory.fabricColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Category created response:", response.data);

      setNewCategory({
        category: "",
        fabricColor: "",
        rollSize: "",
        gsm: "",
        fabricQuality: "",
        quantity: "",
      });

      setFormOpen(false);
      fetchCategories();
      toast.success("Category added successfully");
    } catch (error) {
      console.log("errors is category", error);
      // Extract server error message if available
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "Error adding category";
      toast.error(errorMessage);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true); // set isLoading to true when fetching starts
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      const response = await axios.get(
        `${API_BASE_URL}/inventory/raw-materials`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Fetched categories:", response);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error?.message || "Error fetching categories";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // set isLoading to false when fetching is complete
    }
  };
  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  // Delete category
  const handleDeleteCategory = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      // Send DELETE request to backend
      await axios.delete(
        `${API_BASE_URL}/inventory/raw-material/${productToDelete?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      const errorMessage = error?.message || "Error delete category";
      toast.error(errorMessage);
    }
  };

  const handleDeleteSubCategory = async (subCategory) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      // Send DELETE request to backend
      await axios.delete(
        `${API_BASE_URL}/inventory/raw-material/sub-category/${subCategory?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Sub Category deleted successfully");
      fetchSubCategories();
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleViewSubcategories = (category) => {
    console.log("category", category);
    setSelectedCategory(category);
    setViewSubcategoriesOpen(true);
  };

  const handleOpenModal = (category) => {
    setSelectedOrderId(category._id);
    console.log("category is", category);
    setQuantityToUpdate(category.quantity_kgs);
    setUpdateQuantityModalOpen(true);
  };

  const handleQuantityUpdate = async () => {
    if (!unitToUpdate) {
      toast.error("Please Enter Quantity");
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      // Send PUT request to backend
      const response = await axios.put(
        `${API_BASE_URL}/inventory/raw-material/${selectedOrderId}`,
        {
          quantity_kgs: unitToUpdate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Row Material Updated successfully");
      setUpdateQuantityModalOpen(false); // Close modal
      setQuantityToUpdate(""); // Reset input field
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Download category PDF file
  const handleDownloadData = async (category) => {
    try {
      // Fetch subcategories from API
      const response = await axios.get(
        `${API_BASE_URL}/inventory/raw-material/sub-category/${category._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      const subcategories = response.data.data || [];
      console.log("subcategories", subcategories);
      // console.log('subcategories', subcategories);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 14;
      let currentY = 10;

      const textX = marginLeft + 90;

      // **Company Header Section**
      const logoSize = 30; // Set smaller size
      const marginTop = 15;
      currentY = marginTop;
      doc.addImage(
        COMPANY_LOGO,
        "PNG",
        marginLeft,
        currentY,
        logoSize,
        logoSize
      );
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thailiwale Industries Private Limited", textX, currentY + 5);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Address (properly spaced)
      doc.text(
        "201/1/4, SR Compound, Lasudiya Mori, Lasudia, Indore 453771",
        textX,
        currentY + 12
      );
      doc.text("Email: info@thailiwale.com", textX, currentY + 19);
      doc.text("Phone: +917999857050, +918989788532", textX, currentY + 26);

      // Line Separator
      currentY += 40;
      doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
      currentY += 10; // Move down slightly

      // **Category Title**
      doc.setFontSize(14);
      doc.text(`${category.category_name} Details`, marginLeft, currentY);
      currentY += 8;

      // **Category Fabric Details (Table-like Layout)**
      doc.setFontSize(11);
      const details = [
        ["Fabric Color", category.fabric_color],
        ["Roll Size", category.roll_size],
        ["GSM", category.gsm],
        ["Fabric Quality", category.fabric_quality],
        ["Quantity", `${category.quantity_kgs} kg`],
        [
          "Total Rolls",
          Array.isArray(subcategories) ? subcategories.length : 0,
        ],
      ];

      doc.autoTable({
        startY: currentY,
        head: [["Property", "Details"]],
        body: details,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { cellWidth: 100 },
        },
      });

      currentY = doc.autoTable.previous.finalY + 10; // Move below fabric details

      // **Subcategories Table**
      if (subcategories.length > 0) {
        doc.setFontSize(12);
        doc.text("Roll Details:", marginLeft, currentY);
        currentY += 5;

        const tableColumn = [
          "Roll ID",
          "Fabric Color",
          "Roll Size",
          "GSM",
          "Fabric Quality",
          "Quantity (kg)",
          "QR Code",
        ];
        let tableRows = [];

        // **Generate QR Codes Only for Existing Subcategories**
        const qrCodes = await Promise.all(
          subcategories.map(async (sub) => {
            const qrData = JSON.stringify({
              fabricColor: sub.fabricColor,
              rollSize: sub.rollSize,
              gsm: sub.gsm,
              fabricQuality: sub.fabricQuality,
              quantity: sub.quantity,
            });
            return await QRCode.toDataURL(qrData);
          })
        );

        // **Ensure Exact Number of Rows**
        subcategories.forEach((sub) => {
          tableRows.push([
            sub._id,
            sub.fabricColor,
            sub.rollSize,
            sub.gsm,
            sub.fabricQuality,
            sub.quantity,
            "", // Placeholder for QR code
          ]);
        });

        doc.autoTable({
          startY: currentY,
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 11,
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 10, cellPadding: 8 },
          columnStyles: {
            0: { cellWidth: 30 }, // Material ID
            1: { cellWidth: 30 }, // Fabric Color
            2: { cellWidth: 25 }, // Roll Size
            3: { cellWidth: 25 }, // GSM
            4: { cellWidth: 30 }, // Fabric Quality
            5: { cellWidth: 25 }, // Quantity (kg)
            6: { cellWidth: 30 }, // QR Code
          },

          didDrawCell: (data) => {
            if (data.column.index === 6 && data.row.section === "body") {
              // QR Code column
              const qrSize = 18;
              const xPos = data.cell.x + (data.cell.width - qrSize) / 2;
              const yPos = data.cell.y + (data.cell.height - qrSize) / 2;

              const subcategoryIndex = data.row.index;
              if (subcategoryIndex < qrCodes.length) {
                doc.addImage(
                  qrCodes[subcategoryIndex],
                  "PNG",
                  xPos,
                  yPos,
                  qrSize,
                  qrSize
                );
              }
            }
          },
        });

        currentY = doc.autoTable.previous.finalY + 10;
      }

      // **Footer Section**
      // **Footer Section**
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(10);
        doc.text(
          `Generated on: ${new Date().toLocaleDateString()}  Page ${i} of ${pageCount}`,
          pageWidth - 80,
          pageHeight - 10
        );
      }
      // **Save the PDF**
      doc.save(`${category.category_name}-details.pdf`);
      toast.success("Data downloaded successfully");
    } catch (error) {
      console.error("Error fetching subcategories or generating PDF:", error);
      toast.error("Failed to download data. Please try again.");
    }
  };

  // add sub category
  const handleAddNewSubcategory = async () => {
    if (!newSubcategory.quantity || newSubcategory.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    // Ensure all required fields are filled
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        throw new Error("Unauthorized: No token provided");
      }

      // Attach category ID to subcategory data
      const requestData = {
        fabricColor: selectedCategory.fabric_color, // 🔹 Use selectedCategory
        rollSize: selectedCategory.roll_size, // 🔹 Use selectedCategory
        gsm: selectedCategory.gsm, // 🔹 Use selectedCategory
        fabricQuality: selectedCategory.fabric_quality, // 🔹 Use selectedCategory
        quantity: newSubcategory.quantity, // ✅ Allow user input for quantity
        category: selectedCategory._id, // ✅ Attach category ID
      };
      // Send POST request to add subcategory
      const response = await axios.post(
        `${API_BASE_URL}/inventory/raw-material/sub-category`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Subcategory created response:", response);
      toast.success("Subcategory added successfully");

      // Update UI: Add new subcategory to state
      setSubCategories((prev) => [...prev, response.data.data]);

      // Reset form fields after successful submission
      setNewSubcategory({
        fabricColor: "",
        rollSize: "",
        gsm: "",
        fabricQuality: "",
        quantity: "",
      });
      setAddSubcategoryDialogOpen(false);
      fetchCategories();
    } catch (error) {
      // Extract error message from API response
      console.log("error msg", error.response.data.message);
      let errorMessage = "Error adding subcategory.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // fetch subcategories
  const fetchSubCategories = async () => {
    if (selectedCategory) {
      try {
        // Make GET request to fetch subcategories by categoryId
        const response = await axios.get(
          `${API_BASE_URL}/inventory/raw-material/sub-category/${selectedCategory?._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`, // Make sure to add your token here
            },
          }
        );
        setSubCategories(response.data.data);
        console.log("subcat res : ", response);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    }
  };

  useEffect(() => {
    fetchBagAttributes();
    fetchSubCategories();
  }, [selectedCategory]);

  const fetchBagAttributes = async () => {
    try {
      const response = await orderService.getBagAttributes();
      console.log("response", response.data.gsm);
      if (response.success) {
        setBagAttributes(response.data);
      }
    } catch (error) {
      toast.error("Error fetching bag attributes");
    }
  };

  const renderAddCategoryDialog = () => (
    <Dialog
      open={formOpen}
      onClose={() => setFormOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Add Category</Typography>
          <IconButton onClick={() => setFormOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCategory.category}
                label="Category"
                onChange={(e) =>
                  setNewCategory({ ...newCategory, category: e.target.value })
                }
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Fabric Color</InputLabel>
              <Select
                value={newCategory.fabricColor || ""}
                label="Fabric Color"
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    fabricColor: e.target.value,
                  })
                }
              >
                {bagAttributes["bag-color"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Roll Size</InputLabel>
              <Select
                value={newCategory.rollSize || ""}
                label="Roll Size"
                onChange={(e) =>
                  setNewCategory({ ...newCategory, rollSize: e.target.value })
                }
              >
                {bagAttributes["roll-size"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>GSM</InputLabel>
              <Select
                value={newCategory.gsm || ""}
                label="GSM"
                onChange={(e) =>
                  setNewCategory({ ...newCategory, gsm: e.target.value })
                }
              >
                {bagAttributes.gsm.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Fabric Quality</InputLabel>
              <Select
                value={newCategory.fabricQuality || ""}
                label="Fabric Quality"
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    fabricQuality: e.target.value,
                  })
                }
              >
                {bagAttributes["fabric-quality"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} className="hidden">
            <TextField
              label="Quantity (kg)"
              fullWidth
              value={newCategory.quantity}
              onChange={(e) =>
                setNewCategory({ ...newCategory, quantity: e.target.value })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setFormOpen(false)}>Cancel</Button>
        <Button onClick={handleAddCategory} variant="contained" color="primary">
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderActions = (category) => (
    <>
      {/* <IconButton
        size="small"
        color="primary"
        onClick={() => handleOpenModal(category)}
      >
        <Edit />
      </IconButton> */}
      <IconButton
        size="small"
        color="error"
        onClick={() => handleDelete(category)}
      >
        <Delete />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleViewSubcategories(category)}
      >
        <Visibility />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleDownloadData(category)}
      >
        <GetApp />
      </IconButton>
    </>
  );

  const renderViewSubcategoriesDialog = () => (
    <Dialog
      open={viewSubcategoriesOpen}
      onClose={() => setViewSubcategoriesOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>
            {
              categoryOptions.find(
                (opt) => opt.value === selectedCategory?.category
              )?.label
            }{" "}
            Roll List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setAddSubcategoryDialogOpen(true)}
          >
            Add a Roll
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fabric Color</TableCell>
                <TableCell>Roll Size (Inch)</TableCell>
                <TableCell>GSM</TableCell>
                <TableCell>Fabric Quality</TableCell>
                <TableCell>Quantity (kg)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : subCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                subCategories.map((subcategory) => (
                  <TableRow key={subcategory._id}>
                    <TableCell>{subcategory._id}</TableCell>
                    <TableCell>
                      {formatSnakeCase(subcategory.fabricColor)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(subcategory.rollSize)}
                    </TableCell>
                    <TableCell>{subcategory.gsm}</TableCell>
                    <TableCell>
                      {formatSnakeCase(subcategory.fabricQuality)}
                    </TableCell>
                    <TableCell>{subcategory.quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={subcategory.is_used ? "Used" : "Unused"}
                        color={subcategory.is_used ? "warning" : "success"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleShowQR(subcategory)}
                      >
                        <QrCode />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSubCategory(subcategory)}
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
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={() => setViewSubcategoriesOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderAddSubcategoryDialog = () => (
    <Dialog
      open={addSubcategoryDialogOpen}
      onClose={() => setAddSubcategoryDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Subcategory</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* <Grid item xs={12}>
            <TextField
              label="Fabric Color"
              fullWidth
              value={selectedCategory?.fabric_color || ""}
              InputProps={{ readOnly: true }} // 🔹 Read-only
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Roll Size"
              fullWidth
              value={selectedCategory?.roll_size || ""}
              InputProps={{ readOnly: true }} // 🔹 Read-only
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="GSM"
              type="number"
              fullWidth
              value={selectedCategory?.gsm || ""}
              InputProps={{ readOnly: true }} // 🔹 Read-only
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Fabric Quality"
              fullWidth
              value={selectedCategory?.fabric_quality || ""}
              InputProps={{ readOnly: true }} // 🔹 Read-only
            />
          </Grid> */}
          <Grid item xs={12}>
            <TextField
              label="Quantity (kg)"
              type="number"
              fullWidth
              value={newSubcategory.quantity}
              onChange={(e) => {
                const quantity = e.target.value;
                if (quantity <= 0) {
                  setNewSubcategory({ ...newSubcategory, quantity: "" });
                  toast.error("Quantity must be greater than 0");
                } else {
                  setNewSubcategory({ ...newSubcategory, quantity });
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setAddSubcategoryDialogOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleAddNewSubcategory}
          variant="contained"
          color="primary"
        >
          Add Subcategory
        </Button>
      </DialogActions>
    </Dialog>
  );

  // handle qr open
  const handleShowQR = (order) => {
    setSelectedQrOrder(order);
    setQrDialogOpen(true);
  };

  return (
    <>
      <Card sx={{ mb: 2, p: 3 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            Raw Materials -{" "}
            <Typography component="span" variant="body2" color="error">
              * To create a category, the Fabric Color, GSM, and Quality must
              match the selected order.
            </Typography>
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            Add Category
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Fabric Color</TableCell>
                <TableCell>Roll Size (Inch)</TableCell>
                <TableCell>GSM</TableCell>
                <TableCell>Fabric Quality</TableCell>
                <TableCell>Quantity (kg)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {categoryOptions.find(
                        (opt) => opt.value === category.category_name
                      )?.label || formatSnakeCase(category.category_name)}
                    </TableCell>
                    <TableCell>
                      {formatSnakeCase(category.fabric_color)}
                    </TableCell>
                    <TableCell>{formatSnakeCase(category.roll_size)}</TableCell>
                    <TableCell>{category.gsm}</TableCell>
                    <TableCell>
                      {formatSnakeCase(category.fabric_quality)}
                    </TableCell>
                    <TableCell>
                      {category.totalSubcategoryQuantity ?? 0}
                    </TableCell>
                    <TableCell>{renderActions(category)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        open={updateQuantityModalOpen}
        onClose={() => setUpdateQuantityModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Update Quantity (kg)
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Quantity (kg)"
                type="number"
                fullWidth
                value={unitToUpdate}
                onChange={(e) => setQuantityToUpdate(e.target.value)}
              />
            </Grid>
          </FormControl>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => setUpdateQuantityModalOpen(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleQuantityUpdate}>
              Add
            </Button>
          </Box>
        </Box>
      </Modal>

      {renderAddCategoryDialog()}
      {renderViewSubcategoriesDialog()}
      {renderAddSubcategoryDialog()}
      <QRCodeDialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        orderData={selectedQrOrder}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Raw Material"
        content="Are you sure you want to delete this raw material? This action cannot be undone."
      />
    </>
  );
}
