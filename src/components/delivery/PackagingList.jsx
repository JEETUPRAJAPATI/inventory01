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
  Chip,
  CircularProgress,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { formatSnakeCase } from "../../utils/formatSnakeCase";

const mockPackages = [
  {
    id: 1,
    orderNumber: "ORD-001",
    items: 5,
    status: "Ready",
    weight: "2.5 kg",
    dimensions: "30x20x15 cm",
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    items: 3,
    status: "Pending",
    weight: "1.8 kg",
    dimensions: "25x15x10 cm",
  },
];

export default function PackagingList() {
  return (
    <Card>
      <div className="p-4">
        <Typography variant="h6">Packaging List</Typography>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : mockPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No packages found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              mockPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{formatSnakeCase(pkg.orderNumber)}</TableCell>
                  <TableCell>{pkg.items}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatSnakeCase(pkg.status)}
                      color={pkg.status === "Ready" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{pkg.weight}</TableCell>
                  <TableCell>{formatSnakeCase(pkg.dimensions)}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
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
  );
}
