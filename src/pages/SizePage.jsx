import { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import salesService from "../services/saleService.js";
import toast from "react-hot-toast";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { formatSnakeCase } from "../utils/formatSnakeCase.js";

export default function SizePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await salesService.size.getAll();
      setList(response || []);
      setFilteredList(response || []);
    } catch (error) {
      toast.error("Failed to fetch Sizes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let updated = list;
    if (filters.search) {
      updated = updated.filter((item) =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.status !== "all") {
      updated = updated.filter((item) => item.status === filters.status);
    }
    setFilteredList(updated);
    setPage(0);
  }, [filters, list]);

  const handleAdd = () => {
    setSelectedItem(null);
    setName("");
    setStatus("active");
    setFormOpen(true);
  };

  const handleEdit = async (id) => {
    try {
      const res = await salesService.size.getById(id);
      setSelectedItem(res);
      setName(res.name || "");
      setStatus(res.status || "active");
      setFormOpen(true);
    } catch {
      toast.error("Failed to load Size details");
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await salesService.size.delete(itemToDelete._id);
      toast.success("Size deleted");
      setDeleteDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to delete Size");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (selectedItem) {
        await salesService.size.update(selectedItem._id, { name, status });
        toast.success("Size updated");
      } else {
        await salesService.size.create({ name, status });
        toast.success("Size added");
      }
      setFormOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const paginatedData = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Card sx={{ mb: 2, p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Typography variant="h6">Sizes</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Add Size
          </Button>
        </Box>

        <Box display="flex" gap={2} px={2} pb={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search Size..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{ startAdornment: <Search /> }}
          />
          <TextField
            select
            size="small"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No Sizes found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{formatSnakeCase(item.name)}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(item.status)}
                        color={item.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(item._id)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(item)}
                        color="error"
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedItem ? "Edit Size" : "Add Size"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            select
            label="Status"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setFormOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Size"
        content="Are you sure you want to delete this Size? This action cannot be undone."
      />
    </>
  );
}
