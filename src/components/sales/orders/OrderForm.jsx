import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField } from '@mui/material';
import FormInput from '../../common/FormInput';
import FormSelect from '../../common/FormSelect';
import orderService from '/src/services/orderService.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';

const initialFormData = {
  customerName: '',
  email: '',
  address: '',
  mobileNumber: '',
  bagDetails: {
    type: '',
    handleColor: '',
    size: '',
    color: '',
    printColor: '',
    gsm: '',
  },
  jobName: '',
  fabricQuality: '',
  quantity: '',
  agent: '',
  orderPrice: '',
  status: 'pending',
};

const bagTypes = [
  { value: 'd_cut_loop_handle', label: 'Loop Handle (D-cut)' },
  { value: 'w_cut_box_bag', label: 'Box Bag (W-cut)' },
];

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderForm({ open, onClose, onSubmit, order = null }) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [mobileNumbers, setMobileNumbers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        bagDetails: {
          type: order.bagDetails?.type || '',
          handleColor: order.bagDetails?.handleColor || '',
          size: order.bagDetails?.size || '',
          color: order.bagDetails?.color || '',
          printColor: order.bagDetails?.printColor || '',
          gsm: order.bagDetails?.gsm || '',
        },
      });
    } else {
      setFormData(initialFormData);
    }

    const fetchMobileNumbers = async () => {
      try {
        const response = await orderService.getUsedMobileNumbers();
        if (response.success) {
          setMobileNumbers(response.data);
        }
      } catch (error) {
        toast.error('Error fetching mobile numbers');
      }
    };

    fetchMobileNumbers();
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (section && field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMobileNumberSearch = async (event, newValue) => {
    if (newValue) {
      // If the new value is in the list of existing mobile numbers
      if (mobileNumbers.includes(newValue)) {
        try {
          // Fetch order details based on the mobile number
          const response = await orderService.getOrderByMobileNumber(newValue);
          if (response.success && response.data.length > 0) {
            const orderData = response.data[0];
            setFormData({
              ...formData,
              customerName: orderData.customerName,
              email: orderData.email,
              address: orderData.address,
              mobileNumber: newValue,
            });
          }
        } catch (error) {
          toast.error('Error fetching order details');
        }
      } else {
        setFormData(prev => ({
          ...prev,
          mobileNumber: newValue,
          customerName: '',
          email: '',
          address: '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        mobileNumber: '',
        customerName: '',
        email: '',
        address: '',
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { _id, orderId, createdAt, updatedAt, __v, ...orderDataWithoutId } = formData;
    try {
      if (order) {
        await orderService.updateOrder(order._id, orderDataWithoutId);
        toast.success('Order updated successfully!');
      } else {
        await orderService.createOrder(orderDataWithoutId);
        toast.success('Order created successfully!');
      }
      onSubmit(formData);
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      // Check if error response is available from server
      if (error.response) {
        const errorMessage = error.response.data.message || 'Something went wrong';
        toast.error(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error('No response from server. Please try again later.');
      } else {
        // Some other error occurred
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const mobileOptions = mobileNumbers.map(number => ({
    value: number,
    label: number,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{order ? 'Edit Order' : 'Create New Order'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <TextField
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                fullWidth
                required

                className="text-sm"
                placeholder="Enter customer name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                value={formData.mobileNumber}
                onChange={handleMobileNumberSearch}
                onInputChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    mobileNumber: newValue,
                  }));
                }}
                options={mobileNumbers}
                getOptionLabel={(option) => option}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or enter mobile number"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <label className="text-sm">
                Address <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                multiline
                rows={3}
                className="text-sm"
                placeholder="Enter address"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Email <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Enter email"
              />
            </Grid>

            {/* Bag Specifications */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Bag Type <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="bagDetails.type"
                value={formData.bagDetails.type}
                onChange={handleChange}
                options={bagTypes}
                required
                className="text-sm"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Handle Color <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="bagDetails.handleColor"
                value={formData.bagDetails.handleColor}
                onChange={handleChange}
                className="text-sm"
                placeholder="Handle Color"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Size <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="bagDetails.size"
                value={formData.bagDetails.size}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="e.g., 12x15x4 inches"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Job Name <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="jobName"
                value={formData.jobName}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Job Name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Bag Color <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="bagDetails.color"
                value={formData.bagDetails.color}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Bag Color"
              />
            </Grid>

            {/* Print and Material Details */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Print Color <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="bagDetails.printColor"
                value={formData.bagDetails.printColor}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Print Color"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                GSM <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="bagDetails.gsm"
                type="number"
                value={formData.bagDetails.gsm}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="GSM"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Fabric Quality <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="fabricQuality"
                value={formData.fabricQuality}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="e.g., cotton"
              />
            </Grid>

            {/* Order Details */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Quantity (Kg) <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Quantity"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Agent <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="agent"
                value={formData.agent}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Agent"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Order Value <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="orderPrice"
                value={formData.orderPrice}
                onChange={handleChange}
                required
                className="text-sm"
                placeholder="Order Value"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Status <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={orderStatuses}
                required
                className="text-sm"
                placeholder="Status"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {order ? 'Update' : 'Create'} Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
