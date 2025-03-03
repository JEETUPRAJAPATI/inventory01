import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';
import orderService from '/src/services/productionManagerService.js';
import UpdateDetailsDialog from './UpdateDetailsDialog';
import FullDetailsDialog from './FullDetailsDialog';

export default function DCutProductionPage() {
  function ProductionTable({ type }) {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [fullDetailsDialogOpen, setFullDetailsDialogOpen] = useState(false);
    const [orderIdForDialog, setOrderIdForDialog] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedQuantityKg, setSelectedQuantityKg] = useState(null);

    useEffect(() => {
      fetchRecords();
    }, []);

    useEffect(() => {
      filterRecords();
    }, [searchQuery, statusFilter, records]);

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await orderService.getDcutOrders();
        if (response.data && Array.isArray(response.data)) {
          setRecords(response.data);
          setFilteredRecords(response.data);
        } else {
          setRecords([]);
          setFilteredRecords([]);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setLoading(false);
      }
    };

    const filterRecords = () => {
      let filtered = records;

      if (searchQuery) {
        filtered = filtered.filter(record =>
          record.jobName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.orderId.toString().includes(searchQuery)
        );
      }

      if (statusFilter) {
        filtered = filtered.filter(record => record.productionManager?.status === statusFilter);
      }

      setFilteredRecords(filtered);
    };

    const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
      setStatusFilter(event.target.value);
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleUpdate = (orderId, quantity) => {
      // Set the orderId immediately for dialog
      setOrderIdForDialog(orderId);

      // Fetch the production record before opening the dialog
      orderService.getProductionRecord(orderId)
        .then((record) => {
          console.log('listing is', record)
          setSelectedRecord(record);

          setSelectedQuantityKg(quantity);

          setDialogOpen(true);
        })
        .catch((error) => {
          console.error('Error fetching production record:', error);
        });
    };
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Bag Size</TableCell>
                  <TableCell>GSM</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Print Color</TableCell>
                  <TableCell>Fabric Color</TableCell>
                  <TableCell>Production Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.orderId}</TableCell>
                    <TableCell>{record.jobName || 'N/A'}</TableCell>
                    <TableCell>{record.bagDetails?.size || 'N/A'}</TableCell>
                    <TableCell>{record.bagDetails?.gsm || 'N/A'}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{record.bagDetails?.printColor || 'N/A'}</TableCell>
                    <TableCell>{record.bagDetails?.color || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={record?.productionManager?.status || 'N/A'}
                        color={
                          record?.productionManager?.status === 'completed' ? 'success' :
                            record?.productionManager?.status === 'pending' ? 'warning' :
                              record?.productionManager?.status === 'in_progress' ? 'info' :
                                record?.productionManager?.status === 'cancelled' ? 'error' :
                                  'default'
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton color="primary" size="small" onClick={() => handleUpdate(record.orderId, record.quantity)}>
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}

        <UpdateDetailsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} record={selectedRecord} quantityKg={selectedQuantityKg}
          type={type}
          orderId={orderIdForDialog} fetchRecords={fetchRecords} />
        <FullDetailsDialog open={fullDetailsDialogOpen} onClose={() => setFullDetailsDialogOpen(false)} record={selectedRecord} />
      </Box>
    );
  }

  return <ProductionTable type="DCut" />;
}
