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
} from "@mui/material";
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
import authService from "../../services/authService";
import QRCodeDialog from "../../components/sales/orders/QRCodeDialog";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from "qrcode";
import COMPANY_LOGO from '../../assets/logo.jpg';
const categoryOptions = [
  { value: "fabric", label: "Fabric" },
  { value: "handle", label: "Handle" },
  { value: "thread", label: "Thread" },
  { value: "dye", label: "Dye" },
];

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


export default function RawMaterials() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewSubcategoriesOpen, setViewSubcategoriesOpen] = useState(false);
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [updateQuantityModalOpen, setUpdateQuantityModalOpen] = useState(false);

  const [unitToUpdate, setQuantityToUpdate] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
  const handleAddCategory = async () => {
    console.log('calling api');
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
          quantity_kgs: newCategory.quantity,
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
      console.log('errors is category', error)
      const errorMessage = error?.message || 'Error adding category';
      toast.error(errorMessage);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
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
    }
  };

  // Delete category
  const handleDeleteCategory = async (category) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: No token provided");
      }

      // Send DELETE request to backend
      await axios.delete(
        `${API_BASE_URL}/inventory/raw-material/${category?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
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
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleViewSubcategories = (category) => {
    console.log('category', category);
    setSelectedCategory(category);
    setViewSubcategoriesOpen(true);
  };

  const handleOpenModal = (category) => {
    setSelectedOrderId(category._id);
    console.log('category is', category)
    setQuantityToUpdate(category.quantity_kgs);
    setUpdateQuantityModalOpen(true);
  };


  const handleQuantityUpdate = async () => {
    if (!unitToUpdate) {
      toast.error('Please Enter Quantity');
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
      setQuantityToUpdate(''); // Reset input field
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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 14;
      let currentY = 10;

      const textX = marginLeft + 90;

      // **Company Header Section**
      const logoSize = 30; // Set smaller size
      const marginTop = 15;
      currentY = marginTop;
      doc.addImage(COMPANY_LOGO, "PNG", marginLeft, currentY, logoSize, logoSize);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thailiwale", textX, currentY + 5);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Address (properly spaced)
      doc.text("Address: 201/1/4, SR Compound, Dewas Naka,", textX, currentY + 12);
      doc.text("Lasudia Mori, Indore, Madhya Pradesh 452016", textX, currentY + 19);
      doc.text("Email: info@thailiwale.com", textX, currentY + 26);
      doc.text("Phone: +91 7999857050", textX, currentY + 33);

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
      ];

      doc.autoTable({
        startY: currentY,
        head: [["Property", "Details"]],
        body: details,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { cellWidth: 100 },
        },
      });

      currentY = doc.autoTable.previous.finalY + 10; // Move below fabric details

      // **Subcategories Table**
      if (subcategories.length > 0) {
        doc.setFontSize(12);
        doc.text("Subcategories:", marginLeft, currentY);
        currentY += 5;

        const tableColumn = [
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
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 40 },
            4: { cellWidth: 30 },
            5: { cellWidth: 40 },
          },
          didDrawCell: (data) => {
            if (data.column.index === 5 && data.row.section === "body") {
              const qrSize = 18;
              const xPos = data.cell.x + (data.cell.width - qrSize) / 2;
              const yPos = data.cell.y + (data.cell.height - qrSize) / 2;

              const subcategoryIndex = data.row.index;
              if (subcategoryIndex < qrCodes.length) {
                doc.addImage(qrCodes[subcategoryIndex], "PNG", xPos, yPos, qrSize, qrSize);
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
        doc.text(`Generated on: ${new Date().toLocaleDateString()}  Page ${i} of ${pageCount}`, pageWidth - 80, pageHeight - 10);
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
    console.log("selected category : ", selectedCategory);
    if (!selectedCategory) {
      toast.error("Please select a category before adding a subcategory.");
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
        fabricColor: selectedCategory.fabric_color,  // 🔹 Use selectedCategory
        rollSize: selectedCategory.roll_size,        // 🔹 Use selectedCategory
        gsm: selectedCategory.gsm,                  // 🔹 Use selectedCategory
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
      console.log('error msg', error.response.data.message)
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
    fetchSubCategories();
  }, [selectedCategory]);

  const renderAddCategoryDialog = () => (
    <Dialog
      open={formOpen}
      onClose={() => setFormOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add Category</DialogTitle>
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
            <TextField
              label="Fabric Color"
              fullWidth
              value={newCategory.fabricColor}
              onChange={(e) =>
                setNewCategory({ ...newCategory, fabricColor: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Roll Size"
              fullWidth
              value={newCategory.rollSize}
              onChange={(e) =>
                setNewCategory({ ...newCategory, rollSize: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="GSM"
              fullWidth
              type="number"
              value={newCategory.gsm}
              onChange={(e) =>
                setNewCategory({ ...newCategory, gsm: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Fabric Quality"
              fullWidth
              value={newCategory.fabricQuality}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  fabricQuality: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Quantity (kg)"
              fullWidth
              type="number"
              value={newCategory.quantity}
              onChange={(e) =>
                setNewCategory({ ...newCategory, quantity: e.target.value })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFormOpen(false)}>Cancel</Button>
        <Button onClick={handleAddCategory} variant="contained" color="primary">
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderActions = (category) => (
    <>
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleOpenModal(category)}
      >
        <Edit />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={() => handleDeleteCategory(category)}
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
            - Subcategories
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setAddSubcategoryDialogOpen(true)}
          >
            Add Subcategory
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
                <TableCell>Roll Size</TableCell>
                <TableCell>GSM</TableCell>
                <TableCell>Fabric Quality</TableCell>
                <TableCell>Quantity (kg)</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell>Action</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {subCategories.map((subcategory, subIndex) => (
                <TableRow key={subIndex}>
                  <TableCell>{subcategory._id}</TableCell>
                  <TableCell>{subcategory.fabricColor}</TableCell>
                  <TableCell>{subcategory.rollSize}</TableCell>
                  <TableCell>{subcategory.gsm}</TableCell>
                  <TableCell>{subcategory.fabricQuality}</TableCell>
                  <TableCell>{subcategory.quantity}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
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
              onChange={(e) =>
                setNewSubcategory({
                  ...newSubcategory,
                  quantity: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
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
      <Card>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Raw Materials</Typography>
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
                <TableCell>Roll Size</TableCell>
                <TableCell>GSM</TableCell>
                <TableCell>Fabric Quality</TableCell>
                <TableCell>Quantity (kg)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {
                      categoryOptions.find(
                        (opt) => opt.value === category.category_name
                      )?.label
                    }
                  </TableCell>
                  <TableCell>{category.fabric_color}</TableCell>
                  <TableCell>{category.roll_size}</TableCell>
                  <TableCell>{category.gsm}</TableCell>
                  <TableCell>{category.fabric_quality}</TableCell>
                  <TableCell>{category.quantity_kgs}</TableCell>
                  <TableCell>{renderActions(category)}</TableCell>
                </TableRow>
              ))}
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
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setUpdateQuantityModalOpen(false)} sx={{ mr: 1 }}>
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
    </>
  );
}
