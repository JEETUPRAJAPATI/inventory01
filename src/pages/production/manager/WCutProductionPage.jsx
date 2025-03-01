import { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  TablePagination, TextField, Select, MenuItem, Button
} from '@mui/material';
import { Edit, Visibility, Add } from '@mui/icons-material';

import UpdateDetailsDialog from './UpdateDetailsDialog';
import FullDetailsDialog from './FullDetailsDialog';
import orderService from '/src/services/productionManagerService.js';

export default function WCutProductionPage() {
  function ProductionTable({ type }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [fullDetailsDialogOpen, setFullDetailsDialogOpen] = useState(false);
    const [orderIdForDialog, setOrderIdForDialog] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
      fetchRecords();
    }, []);

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await orderService.getWcutOrders();
        setRecords(response.data || []);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleUpdate = (orderId) => {
      setOrderIdForDialog(orderId);
      orderService.getProductionRecord(orderId)
        .then((record) => {
          setSelectedRecord(record);
          setUpdateDialogOpen(true);
        })
        .catch((error) => {
          console.error('Error fetching production record:', error);
        });
    };

    const handleViewFullDetails = async (orderId) => {
      try {
        const fullDetails = await orderService.getFullOrderDetails(orderId);
        setSelectedRecord(fullDetails.data);
        setFullDetailsDialogOpen(true);
      } catch (error) {
        console.error('Error fetching full details:', error);
      }
    };

    const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
      setPage(0);
    };

    const handleStatusFilterChange = (event) => {
      setStatusFilter(event.target.value);
      setPage(0);
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    // 🏷️ Filtering Logic (Search + Status)
    const filteredRecords = records.filter(record => {
      const matchesSearch =
        record.jobName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.orderId?.toString().includes(searchQuery);

      const matchesStatus = statusFilter ? record.productionManager?.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });

    return (
      <Box>
        <div className="flex justify-between items-center p-4">

          <Typography variant="h6" gutterBottom>{type} Production Records</Typography>

          <div className="flex gap-3">
            {/* Search Box */}
            <TextField
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </div>
        </div>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Job Name</TableCell>
                    <TableCell>Bag Size</TableCell>
                    <TableCell>GSM</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Print Colour</TableCell>
                    <TableCell>Fabric Colour</TableCell>
                    <TableCell>Fabric Quality</TableCell>
                    <TableCell>Production Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.orderId}</TableCell>
                        <TableCell>{record.jobName || 'N/A'}</TableCell>
                        <TableCell>{record.bagDetails?.size || 'N/A'}</TableCell>
                        <TableCell>{record.bagDetails?.gsm || 'N/A'}</TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>{record.bagDetails?.printColor || 'N/A'}</TableCell>
                        <TableCell>{record.bagDetails?.color || 'N/A'}</TableCell>
                        <TableCell>{record.fabricQuality || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.productionManager?.status || "N/A"}
                            color={
                              record.productionManager?.status === "Completed"
                                ? "success"
                                : record.productionManager?.status === "Pending"
                                  ? "warning"
                                  : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary" size="small" onClick={() => handleUpdate(record.orderId)}>
                            <Edit />
                          </IconButton>
                          <IconButton color="secondary" size="small" onClick={() => handleViewFullDetails(record.orderId)}>
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        <UpdateDetailsDialog
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          record={selectedRecord}
          type={type}
          orderId={orderIdForDialog}
          fetchRecords={fetchRecords}
        />

        <FullDetailsDialog
          open={fullDetailsDialogOpen}
          onClose={() => setFullDetailsDialogOpen(false)}
          record={selectedRecord}
        />
      </Box>
    );
  }

  return <ProductionTable type="WCut" />;
}
