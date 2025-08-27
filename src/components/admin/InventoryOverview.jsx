import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import productService from "../../services/productService";
import purchaseOrderService from "../../services/purchaseOrderService";
import { API_BASE_URL } from "../../config/constants.js";
import authService from "../../services/authService.js";
import { formatSnakeCase } from "../../utils/formatSnakeCase.js";
export default function InventoryOverview() {
  const [inventoryData, setInventoryData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const token = authService.getToken();
        const productResponse = await productService.getProducts();
        const purchaseOrderResponse = await purchaseOrderService.getOrders();
        const rawMaterialResponse = await axios.get(
          `${API_BASE_URL}/inventory/raw-materials`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Products:", productResponse.data);
        console.log("Purchase Orders:", purchaseOrderResponse.data);
        console.log("Raw Materials:", rawMaterialResponse.data);

        const updatedInventoryData = [
          {
            id: 1,
            category: "Raw Materials",
            totalItems: Array.isArray(rawMaterialResponse.data.data)
              ? rawMaterialResponse.data.data.length
              : 0,
            lowStock: rawMaterialResponse.data?.lowStock || 0,
            value: rawMaterialResponse.data?.value || "N/A",
          },
          {
            id: 2,
            category: "Finished Products",
            totalItems: Array.isArray(productResponse.data)
              ? productResponse.data.length
              : 0,
            lowStock: productResponse.data?.lowStock || 0,
            value: productResponse.data?.value || "N/A",
          },
          {
            id: 3,
            category: "Purchase Orders",
            totalItems: Array.isArray(purchaseOrderResponse.data)
              ? purchaseOrderResponse.data.length
              : 0,
            lowStock: purchaseOrderResponse.data?.lowStock || 0,
            value: purchaseOrderResponse.data?.value || "N/A",
          },
        ];

        setInventoryData(updatedInventoryData);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to fetch inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  return (
    <Card>
      <CardHeader title="Inventory Overview" />
      <CardContent>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Items</TableCell>
                  <TableCell>Low Stock</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : inventoryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography>No inventory data found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatSnakeCase(row.category)}</TableCell>
                      <TableCell>{row.totalItems}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatSnakeCase(row.lowStock)}
                          color={row.lowStock > 10 ? "error" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
