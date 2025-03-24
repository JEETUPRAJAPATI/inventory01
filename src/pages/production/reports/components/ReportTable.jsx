import React, { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
  Button,
  TablePagination,
} from '@mui/material';

export default function ReportTable({ records }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
    };
    return colors[status] || 'default';
  };
  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPage(0);
  };
  // Filtering records
  const filteredRecords = records.filter((record) => {
    return (
      (statusFilter === '' || record.status === statusFilter) &&
      (searchQuery === '' || record.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.jobName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  return (
    <Card>
      <div className="flex justify-between items-center p-4">
        <Typography variant="h6">Production Records</Typography>
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
          <Button variant="outlined" onClick={handleResetFilters}>Reset</Button>
        </div>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Job Name</TableCell>
              <TableCell>Bag Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Completion Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow key={record.orderId || Math.random()}>
                    <TableCell>{record.orderId || 'N/A'}</TableCell>
                    <TableCell>{record.jobName || 'N/A'}</TableCell>
                    <TableCell>{record.bagType || 'N/A'}</TableCell>
                    <TableCell>{record.quantity !== undefined ? record.quantity : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status ? record.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
}
