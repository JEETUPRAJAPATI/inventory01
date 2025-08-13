import { useState, useEffect } from "react";
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
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { Visibility, CheckCircle, Cancel } from "@mui/icons-material";

import toast from "react-hot-toast";
import deliveryService from "../../services/deliveryService";
import { formatSnakeCase } from "../../utils/formatSnakeCase";
import { formatDate } from "../../utils/dateUtils";

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveries();
      setDeliveries(response.data.slice(0, 5));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      in_transit: "info",
      done: "success",
      delivered: "success",
    };
    return colors[status] || "default";
  };

  return (
    <>
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Delivery Management
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>No deliveries found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell>
                      {formatSnakeCase(delivery.orderDetails?.customerName)}
                    </TableCell>
                    <TableCell>
                      {delivery.orderDetails?.mobileNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      {formatDate(delivery.deliveryDate) || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(delivery.status)}
                        color={getStatusColor(delivery.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
