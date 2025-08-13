import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { formatSnakeCase } from "../../../utils/formatSnakeCase";

export default function FullDetailsDialog({ open, onClose, record }) {
  const order = record?.order || {}; // Directly access order data
  const productionManager = record?.production_manager || {}; // Directly access production_manager data

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Full Order Details</DialogTitle>
      <DialogContent>
        {/* Order Details Section */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Order ID:</strong> {order.orderId || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Job Name:</strong> {order.jobName || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Customer Name:</strong> {order.customerName || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Fabric Quality:</strong> {order.fabricQuality || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Quantity:</strong> {order.quantity || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Address:</strong> {order.address || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>Type:</strong>{" "}
              {formatSnakeCase(order.bagDetails?.type) || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>Handle Color:</strong>{" "}
              {order.bagDetails?.handleColor || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>Size:</strong> {order.bagDetails?.size || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>Color:</strong> {order.bagDetails?.color || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>Print Color:</strong>{" "}
              {order.bagDetails?.printColor || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography tem xs={12} sm={6} variant="body1">
              <strong>GSM:</strong> {order.bagDetails?.gsm || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Agent:</strong> {order.agent || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Order Status:</strong> {order.status || "N/A"}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Production Manager Section */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Production Manager Details
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Production Status:</strong>{" "}
              {productionManager.status || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Progress:</strong>{" "}
              {productionManager.production_details?.progress || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Remarks:</strong>{" "}
              {productionManager.production_details?.remarks || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Roll Size:</strong>{" "}
              {productionManager.production_details?.roll_size || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Cylinder Size:</strong>{" "}
              {productionManager.production_details?.cylinder_size || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Quantity (Kgs):</strong>{" "}
              {productionManager.production_details?.quantity_kgs || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Quantity (Rolls):</strong>{" "}
              {productionManager.production_details?.quantity_rolls || "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
