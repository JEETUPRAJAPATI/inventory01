import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Card,
  Box,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Print, Update, LocalShipping } from '@mui/icons-material';
import toast from 'react-hot-toast';
import OrderService from '../../../services/dcutOpsertService.js';

export default function OpsertOrderList({ orders, status, noOrdersFound, onStatusUpdated }) {
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [unitToUpdate, setUnitToUpdate] = useState('');
  const getStatusColor = (status) => ({
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  }[status] || 'default');

  const updateOrderStatus = (orderId, newStatus, unitToUpdate, remarks) => {
    OrderService.updateOrderStatus(orderId, newStatus, unitToUpdate, remarks)
      .then(() => {
        toast.success(`Order marked as ${newStatus.replace('_', ' ')}`);
        setUpdateStatusModalOpen(false);
        onStatusUpdated();
      })
      .catch(() => {
        toast.error('Failed to update order status');
      });
  };

  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setUpdateStatusModalOpen(true);
  };
  const handleStatusUpdate = () => {
    if (!unitToUpdate) {
      toast.error('Please select a unit number');
      return;
    }
    updateOrderStatus(selectedOrderId, 'completed', unitToUpdate, 'order move to completed');
  };
  const handleMoveToPackaging = (orderId) => {
    OrderService.moveToPackaging(orderId)
      .then(() => {
        toast.success('Order moved to packaging');
        onStatusUpdated();
      })
      .catch((error) => {
        toast.error('Failed to move to packaging');
      });
  };
  return (
    <Box>
      {/* Desktop View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Bag Type</TableCell>
                <TableCell>Bag Colour</TableCell>
                <TableCell>Print Colour</TableCell>
                <TableCell>Bag Size</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {noOrdersFound ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No Orders Found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.jobName}</TableCell>
                    <TableCell>{order.bagDetails.type}</TableCell>
                    <TableCell>{order.bagDetails.color}</TableCell>
                    <TableCell>{order.bagDetails.printColor}</TableCell>
                    <TableCell>{order.bagDetails.size}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.opsertDetails[0].status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.opsertDetails[0].status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.opsertDetails[0].status === 'pending' && (
                        <Button
                          startIcon={<Print />}
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => updateOrderStatus(order.orderId, 'in_progress', 'Printing started')}
                        >
                          Start Printing
                        </Button>
                      )}
                      {order.opsertDetails[0].status === 'in_progress' && (
                        <Button
                          startIcon={<Update />}
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleOpenModal(order.orderId)}
                        >
                          Complete Order
                        </Button>
                      )}
                      {order.opsertDetails[0].status === 'completed' && (
                        <Button
                          startIcon={<LocalShipping />}
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleMoveToPackaging(order.orderId)}
                        >
                          Move to Packaging
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Unit Number & Remark Modal */}
        <Modal
          open={updateStatusModalOpen}
          onClose={() => setUpdateStatusModalOpen(false)}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Complete Order - Add Details
            </Typography>

            {/* Unit Number Selection */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Unit Number</InputLabel>
              <Select
                value={unitToUpdate}
                onChange={(e) => setUnitToUpdate(e.target.value)}
                label="Unit Number"
              >
                <MenuItem value="1">1</MenuItem>
              </Select>
            </FormControl>


            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setUpdateStatusModalOpen(false)} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleStatusUpdate}>
                Submit
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}

// Modal Styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
