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
import OrderService from '../../../services/wcutBagMakingServices';

export default function WCutBagMakingOrderLists({ orders, noOrdersFound, onStatusUpdated }) {
    const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [unitToUpdate, setUnitToUpdate] = useState('');

    const getStatusColor = (status) => ({
        pending: 'warning',
        in_progress: 'info',
        completed: 'success',
    }[status] || 'default');

    const updateOrderStatus = (orderId, newStatus, unitNumber, remarks) => {
        OrderService.updateOrderStatus(orderId, newStatus, unitNumber, remarks)
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

    const handleMoveToDelivery = (orderId) => {
        OrderService.moveToDelivery(orderId)
            .then(() => {
                toast.success('Order moved to packaging');
                onStatusUpdated();
            })
            .catch(() => {
                toast.error('Failed to move to packaging');
            });
    };

    return (
        <Box>
            <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Job Name</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Bag Type</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Bag Color</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Print Color</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Bag Size</TableCell>
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
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{order.bagDetails.type}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{order.bagDetails.color}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{order.bagDetails.printColor}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{order.bagDetails.size}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.opsertDetails[0].status.replace('_', ' ').toUpperCase()}
                                            color={getStatusColor(order.opsertDetails[0].status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                            {order.opsertDetails[0].status === 'pending' && (
                                                <Button
                                                    startIcon={<Print />}
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => updateOrderStatus(order.orderId, 'in_progress', '', 'Printing started')}
                                                >
                                                    Start
                                                </Button>
                                            )}
                                            {order.opsertDetails[0].status === 'in_progress' && (
                                                <Button
                                                    startIcon={<Update />}
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => handleOpenModal(order.orderId)}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                            {order.opsertDetails[0].status === 'completed' && (
                                                <Button
                                                    startIcon={<LocalShipping />}
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => handleMoveToDelivery(order.orderId)}
                                                >
                                                    Package
                                                </Button>
                                            )}
                                        </Box>
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
                            <MenuItem value="2">2</MenuItem>
                            <MenuItem value="3">3</MenuItem>
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
