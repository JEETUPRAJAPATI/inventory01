import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";

export default function QRCodeDialog({ open, onClose, orderData }) {
  const qrRef = useRef(null);
  console.log('order data is', orderData)
  if (!orderData) return null;

  const qrData = JSON.stringify({
    fabricColor: orderData.fabricColor,
    rollSize: orderData.rollSize,
    gsm: orderData.gsm,
    quantity: orderData.quantity,
    id: orderData._id,
  });

  const downloadQRCode = async () => {
    if (!qrRef.current) {
      console.error("QR Code section not found.");
      return;
    }

    const canvas = await html2canvas(qrRef.current, { backgroundColor: "#fff" });
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `order-${orderData._id}-qr.png`;
    link.click();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Order QR Code</DialogTitle>
      <DialogContent>
        <Box
          ref={qrRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 3,
            bgcolor: "#fff",
            p: 2,
          }}
        >
          <QRCodeCanvas value={qrData} size={300} level="M" includeMargin={true} />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Scan this QR code to get order details
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Row material id:</strong> {orderData._id}
            </Typography>
            <Typography variant="body2">
              <strong>Fabric Color:</strong> {orderData.fabricColor}
            </Typography>
            <Typography variant="body2">
              <strong>Roll Size:</strong> {orderData.rollSize}
            </Typography>
            <Typography variant="body2">
              <strong>GSM:</strong> {orderData.gsm}
            </Typography>
            <Typography variant="body2">
              <strong>Quantity:</strong> {orderData.quantity}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={downloadQRCode}>
          Download QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}
