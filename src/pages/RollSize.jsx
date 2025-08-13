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

export default function RollSize() {
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

  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await salesService.rollSize.getAll(); // changed from bagColor to rollSize
      setList(response || []);
      setFilteredList(response || []);
    } catch (error) {
      toast.error("Failed to fetch roll sizes");
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
      const res = await salesService.rollSize.getById(id);
      setSelectedItem(res);
      setName(res.name || "");
      setStatus(res.status || "active");
      setFormOpen(true);
    } catch {
      toast.error("Failed to load roll size details");
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await salesService.rollSize.delete(itemToDelete._id);
      toast.success("Roll size deleted");
      setDeleteDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to delete roll size");
    }
  };

  const handleSubmit = async ({ name, status }) => {
    if (!name.trim()) {
      toast.error("Roll size name is required");
      return;
    }
    console.log("name, status ", name, status);
    try {
      if (selectedItem) {
        await salesService.rollSize.update(selectedItem._id, { name, status });
        toast.success("Roll size updated");
      } else {
        await salesService.rollSize.create({ name, status });
        toast.success("Roll size added");
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
          <Typography variant="h6">Roll Sizes</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Add Roll Size
          </Button>
        </Box>

        <Box display="flex" gap={2} px={2} pb={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search roll size..."
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
                <TableCell>Roll Size</TableCell>
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
                    No roll sizes found.
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
        <DialogTitle>
          {selectedItem ? "Edit Roll Size" : "Add Roll Size"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Roll Size"
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
          <Button
            onClick={() => handleSubmit({ name, status })}
            variant="contained"
            color="primary"
          >
            {selectedItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Roll Size"
        content="Are you sure you want to delete this roll size? This action cannot be undone."
      />
    </>
  );
}
