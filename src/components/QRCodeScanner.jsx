import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { CloudDownload, Upload } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Test data for QR code


export default function QRCodeScanner({ onScanSuccess }) {
  const [scanning, setScanning] = useState(true); // Start scanning by default
  const [showTestQR, setShowTestQR] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        disableFlip: false
      };
      const hideScanFileOption = () => {
        const element = document.getElementById('html5-qrcode-anchor-scan-type-change');
        if (element) {
          element.style.display = 'none';
        }
      };

      setTimeout(hideScanFileOption, 100); // Wait for the scanner to render

      scannerRef.current = new Html5QrcodeScanner('qr-reader', config);

      const handleScanSuccess = (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (scannerRef.current) {
            scannerRef.current.clear().catch(console.warn);
          }
          toast.success('QR Code scanned successfully');
          onScanSuccess(data);
        } catch (error) {
          toast.error('Invalid QR Code format');
        }
      };

      scannerRef.current.render(handleScanSuccess, console.warn);

      setTimeout(() => {
        const scanRegion = document.getElementById('qr-reader__scan_region');
        if (scanRegion) {
          scanRegion.style.display = 'block';
        }
      }, 500);

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {
            console.log('Scanner cleanup completed');
          });
        }
      };
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {
            console.log('Scanner cleanup completed');
          });
        } catch (error) {
          console.log('Scanner cleanup completed');
        }
      }
    };
  }, [scanning, onScanSuccess]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTimeout(() => {
        onScanSuccess(testData);
        toast.success('Test data loaded successfully');
      }, 500);
    }
  };


  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Top Bar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.12)'
        }}
      >
        <Typography variant="h6">
          Scan QR Code
        </Typography>

        <input
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          id="qr-file-input"
          type="file"
          onChange={handleFileUpload}
        />

      </Box>

      {/* Scanner Area */}
      <Box
        id="qr-reader"
        sx={{
          width: 500,
          marginTop: '16em',
          height: '424',
          display: 'block',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          overflowY: 'hidden',
          background: '#fff'
        }}
      />
      <Box id="MuiDialogContent-root" sx={{ overflowY: 'hidden' }} />



    </Box>
  );
}