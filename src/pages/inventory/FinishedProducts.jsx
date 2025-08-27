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
  TextField,
  MenuItem,
  Button,
  Select,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Delete, Visibility, PictureAsPdf } from "@mui/icons-material";

import FinishedProductForm from "../../components/inventory/forms/FinishedProductForm";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import toast from "react-hot-toast";
import productService from "../../services/productService";
import FinishedProductModel from "./FinishedProductModel";
import { pdfFinishedProduct } from "../../utils/pdfFinishedProduct";
import { formatSnakeCase } from "../../utils/formatSnakeCase";

export default function FinishedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedFinishedProduct, setSelectedFinishedProduct] = useState(null);
  const [filters, setFilters] = useState({ status: "", search: "" });

  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(productToDelete._id);
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleView = async (id) => {
    try {
      const productDetails = await productService.getFullDetailById(id);
      setSelectedFinishedProduct(productDetails);
    } catch (error) {
      toast.error("Failed to fetch product details");
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const productDetails = await productService.getFullDetailById(id);
      pdfFinishedProduct(productDetails.data);
      toast.success("Detail downloaded successfully");
    } catch (error) {
      toast.error("Failed to download details");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: "success",
      pending: "warning",
      completed: "primary",
      out_of_stock: "error",
    };
    return colors[status] || "default";
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply Filters & Pagination
  const filteredProducts = products
    .filter((product) => {
      const customerName = product?.orderDetails?.customerName || "";
      const jobName = product?.orderDetails?.jobName || "";
      const orderId = product?.order_id?.toString() || "";
      return (
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((product) =>
      statusFilter ? product.status === statusFilter : true
    )
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage); // Pagination

  return (
    <>
      <Card sx={{ mb: 2, p: 3 }}>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">Finished Products</Typography>

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
              <MenuItem value="delivered">Delivered</MenuItem>
            </Select>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
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
                <TableCell>Quantity</TableCell>
                <TableCell>Bag Type</TableCell>

                <TableCell>Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{formatSnakeCase(product.order_id)}</TableCell>

                    <TableCell>
                      {formatSnakeCase(product.orderDetails?.customerName)}
                    </TableCell>

                    <TableCell>
                      {formatSnakeCase(product.orderDetails?.jobName)}
                    </TableCell>

                    <TableCell>
                      {formatSnakeCase(product.orderDetails?.quantity)}
                    </TableCell>

                    <TableCell>
                      {formatSnakeCase(
                        product.productionManagerDetails?.production_details
                          ?.type
                      )}
                    </TableCell>

                    <TableCell>
                      {product.orderDetails?.orderPrice !== undefined
                        ? `₹${product.orderDetails.orderPrice}`
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={formatSnakeCase(product.status)}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product)}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(product._id)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadPDF(product._id)}
                      >
                        <PictureAsPdf />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>

      <FinishedProductModel
        open={!!selectedFinishedProduct}
        production={selectedFinishedProduct}
        onClose={() => setSelectedFinishedProduct(null)}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
}
