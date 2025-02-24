import { useState, useEffect } from 'react';
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
  MenuItem,
  TextField,
  Box,
  DialogTitle, DialogContent, DialogActions, Dialog
} from '@mui/material';
import { Edit, Delete, Add, Search, Key } from '@mui/icons-material';
import UserForm from '../components/users/UserForm';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import { useAdminData } from '../hooks/useAdminData';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

export default function UserManagement() {

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [users, setUsers] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [filteredUsers, setFilteredUsers] = useState([]);
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });
  const [loading, setLoading] = useState(false);

  // Fetch users based on filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(); // Fetch all users without filters
      setUsers(response?.data || []);
      setFilteredUsers(response?.data || []); // Initialize filtered users
    } catch (error) {
      toast.error('Error fetching users data');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let updatedUsers = users;

    if (filters.search) {
      updatedUsers = updatedUsers.filter((user) =>
        user.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.mobileNumber.includes(filters.search)
      );
    }

    if (filters.status !== 'all') {
      updatedUsers = updatedUsers.filter((user) => user.status === filters.status);
    }

    setFilteredUsers(updatedUsers);
    setPage(0); // Reset to first page when filters change
  }, [filters, users]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleAdd = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = async (userId) => {
    try {
      const user = await adminService.getUserById(userId);
      setSelectedUser(user);
      setFormOpen(true);
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.deleteUser(userToDelete._id); // Assuming _id is the unique identifier
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      fetchUsers(); // Refresh users list after delete operation
    } catch (error) {
      toast.error('Failed to delete user');
      setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await adminService.updateUser(selectedUser.data._id, formData);
        toast.success('User updated successfully');
      } else {
        await adminService.createUser(formData);
        toast.success('User added successfully');
      }
      setFormOpen(false);
      fetchUsers(); // Refresh users list after add or update operation
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await adminService.updateUser(selectedUserId, { password: newPassword }); // Use newPassword
      toast.success('Password updated successfully');
      handleClosePasswordModal(); // Close modal after success
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (userId) => {
    setSelectedUserId(userId);
    setPasswordModalOpen(true);
  };
  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };
  // Get paginated users
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Card>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">User Management</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add User
          </Button>
        </div>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <TextField
            select
            size="small"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <Button variant="outlined" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobileNumber}</TableCell>
                  <TableCell>{user.registrationType}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(user._id)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                      <Delete />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleUpdatePassword(user._id)}>
                      <Key />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />
      <Dialog open={passwordModalOpen} onClose={handleClosePasswordModal}>
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            margin="dense"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordModal} disabled={loading}>Cancel</Button>
          <Button onClick={handlePasswordUpdate} color="primary" variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        content="Are you sure you want to delete this user? This action cannot be undone."
      />
    </>
  );
}
