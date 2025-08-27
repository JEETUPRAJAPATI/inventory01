import { useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import toast from "react-hot-toast";
import { formatSnakeCase } from "../../utils/formatSnakeCase";

const mockPackages = [
  {
    id: "PKG-001",
    orderId: "ORD-001",
    customerName: "John Doe",
    jobName: "Premium Shopping Bags",
    dimensions: {
      length: 30,
      width: 20,
      height: 15,
      weight: 2.5,
    },
    status: "pending",
  },
  {
    id: "PKG-002",
    orderId: "ORD-002",
    customerName: "Jane Smith",
    jobName: "Eco Friendly Bags",
    dimensions: {
      length: 25,
      width: 15,
      height: 10,
      weight: 1.8,
    },
    status: "ready",
  },
];

export default function PackagingList() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
  });

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setDimensions(pkg.dimensions);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    toast.success("Package dimensions updated successfully");
    setSelectedPackage(null);
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6">Packaging Management</Typography>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Package ID</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Dimensions (cm)</TableCell>
                <TableCell>Weight (kg)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : mockPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No packages found.
                  </TableCell>
                </TableRow>
              ) : (
                mockPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.id}</TableCell>
                    <TableCell>{pkg.orderId}</TableCell>
                    <TableCell>{pkg.customerName}</TableCell>
                    <TableCell>{formatSnakeCase(pkg.jobName)}</TableCell>
                    <TableCell>
                      {pkg.dimensions
                        ? `${pkg.dimensions.length}x${pkg.dimensions.width}x${pkg.dimensions.height}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{pkg.dimensions?.weight ?? "N/A"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={!!selectedPackage} onClose={() => setSelectedPackage(null)}>
        <DialogTitle>Update Package Dimensions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Length (cm)"
                name="length"
                type="number"
                value={dimensions.length}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                name="width"
                type="number"
                value={dimensions.width}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (cm)"
                name="height"
                type="number"
                value={dimensions.height}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                step="0.1"
                value={dimensions.weight}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button onClick={() => setSelectedPackage(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
