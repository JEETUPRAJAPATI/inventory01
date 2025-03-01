import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Delete, Visibility, PictureAsPdf } from '@mui/icons-material';

import FinishedProductForm from '../../components/inventory/forms/FinishedProductForm';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import FinishedProductModel from './FinishedProductModel';
import { pdfFinishedProduct } from '../../utils/pdfFinishedProduct';

export default function FinishedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedFinishedProduct, setSelectedFinishedProduct] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
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
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleView = async (id) => {
    try {
      const productDetails = await productService.getFullDetailById(id);
      setSelectedFinishedProduct(productDetails);
    } catch (error) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const productDetails = await productService.getFullDetailById(id);
      pdfFinishedProduct(productDetails.data);
      toast.success('Detail downloaded successfully');
    } catch (error) {
      toast.error('Failed to download details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'success',
      pending: 'warning',
      completed: 'primary',
      out_of_stock: 'error',
    };
    return colors[status] || 'default';
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({ status: '', search: '' });
  };

  const filteredProducts = products.filter((product) => {
    return (
      (filters.status === '' || product.status === filters.status) &&
      (filters.search === '' ||
        product.order_id.includes(filters.search) ||
        product.orderDetails?.customerName.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  if (loading) {
    return <Typography variant="h6">Loading products...</Typography>;
  }

  return (
    <>
      <Card>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">Finished Products</Typography>
          <div className="flex gap-4">
            <TextField
              select
              size="small"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </TextField>
            <TextField
              size="small"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by Order ID or Name"
            />
            <Button variant="outlined" onClick={handleResetFilters}>Reset</Button>
          </div>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Order Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.order_id || 'N/A'}</TableCell>
                  <TableCell>{product.orderDetails?.customerName || 'N/A'}</TableCell>
                  <TableCell>{product.orderDetails?.quantity || 'N/A'}</TableCell>
                  <TableCell>₹{product.orderDetails?.orderPrice || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={product.status} color={getStatusColor(product.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => handleDelete(product)}>
                      <Delete />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleView(product._id)}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleDownloadPDF(product._id)}>
                      <PictureAsPdf />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
