import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import productionService from '/src/services/productionManagerService.js';

export default function UpdateDetailsDialog({ open, onClose, record, type, orderId, fetchRecords }) {

  const [formData, setFormData] = useState({
    type: type || '', // Initialize with type prop
    roll_size: '',
    cylinder_size: '',
    quantity_kgs: '',
    quantity_rolls: '',
    remarks: '',
  });


  useEffect(() => {
    console.log('record list', record);

    if (record && record.production_details) {
      // Only set form data if production_details exists and contains valid data
      setFormData({
        type: type || '', // Ensure type is included
        roll_size: record.production_details.roll_size || '',
        cylinder_size: record.production_details.cylinder_size || '',
        quantity_kgs: record.production_details.quantity_kgs || '',
        quantity_rolls: record.production_details.quantity_rolls || '',
        remarks: record.production_details.remarks || '', // assuming remarks is at the same level as production_details
      });
    } else {
      // Reset the form data if production_details is null or missing
      setFormData({
        type: type || '', // Ensure type is included even if empty
        roll_size: '',
        cylinder_size: '',
        quantity_kgs: '',
        quantity_rolls: '',
        remarks: '',
      });
    }
  }, [record, type]); // Include record and type as dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('formData', formData);
    console.log('order id', orderId);

    try {
      const updatedRecord = await productionService.updateProductionRecord(formData, orderId);
      if (!updatedRecord || !updatedRecord.data) {
        toast.error('Unexpected response from server. Please try again.');
        return;
      }
      if (updatedRecord.data.production_manager === null) {
        toast.error('Production Manager data is missing');
        return;
      }
      toast.success('Record updated successfully');
      onClose();
      if (fetchRecords) {
        fetchRecords(); // ✅ Call fetchRecords from parent
      }
    } catch (error) {
      console.error('Error updating record:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to update record';
        toast.error(errorMessage);
      } else {
        toast.error('Oops! Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Update {type} Production Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Roll Size"
                name="roll_size"
                value={formData.roll_size}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cylinder Size"
                name="cylinder_size"
                value={formData.cylinder_size}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity (in Kgs)"
                name="quantity_kgs"
                type="number"
                value={formData.quantity_kgs}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity (in Number of Rolls)"
                name="quantity_rolls"
                type="number"
                value={formData.quantity_rolls}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks (if Any)"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
