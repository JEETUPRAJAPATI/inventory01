import { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Box,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { PictureAsPdf, Print } from "@mui/icons-material";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import invoiceService from "../../services/invoiceService"; // Assuming you have an API service for invoices
import { MailOutline } from "@mui/icons-material";
import { formatSnakeCase } from "../../utils/formatSnakeCase";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch invoices on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await invoiceService.getInvoices(); // Assuming `invoiceService.getInvoices()` fetches the invoices
        console.log(response.data);
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Handle downloading PDF for an invoice
  const handleDownloadPDF = (invoice) => {
    console.log("Invoice details:", invoice);

    try {
      generateInvoicePDF(invoice);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  // Apply filters
  const searchLower = searchQuery.toLowerCase();

  const filteredInvoices = invoices
    .filter((invoice) => {
      const invoiceId = invoice?.invoice_id || "";
      const orderId = invoice?.orderDetails?.orderId || ""; // Ensuring order_id is a string
      const customerName =
        invoice?.orderDetails?.customerName?.toLowerCase() || "";

      return (
        invoiceId.toLowerCase().includes(searchLower) ||
        orderId.toLowerCase().includes(searchLower) ||
        customerName.includes(searchLower)
      );
    })
    .filter((invoice) =>
      statusFilter
        ? invoice.status.toLowerCase() === statusFilter.toLowerCase()
        : true
    );

  // Handle adding new invoice
  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setFormOpen(true);
  };

  // Handle editing an existing invoice
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setFormOpen(true);
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  // Handle form submission for adding/editing invoice
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedInvoice) {
        await invoiceService.updateInvoice(selectedInvoice._id, formData);
        toast.success("Invoice updated successfully");
      } else {
        await invoiceService.createInvoice(formData);
        toast.success("Invoice created successfully");
      }
      setFormOpen(false);
      refreshInvoices();
    } catch (error) {
      toast.error("Failed to save invoice");
    }
  };

  const handleSendInvoice = async (invoice) => {
    try {
      await invoiceService.sendInvoiceEmail(invoice.invoice_id);
      toast.success("Invoice sent successfully");
    } catch (error) {
      toast.error("Failed to send invoice");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await invoiceService.deleteInvoice(invoiceToDelete._id);
      toast.success("Invoice deleted successfully");
      setDeleteDialogOpen(false);
      refreshInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  // Refresh the invoices after any CRUD operation
  const refreshInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error("Error refreshing invoices:", error);
      toast.error("Failed to refresh invoices");
    } finally {
      setLoading(false);
    }
  };

  // Get status color for the chip
  const getStatusColor = (status) => {
    const colors = {
      sending: "success",
      pending: "warning",
      paid: "error",
    };
    return colors[status.toLowerCase()] || "default";
  };

  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <div className="flex justify-between items-center p-4">
          <Typography variant="h6"> Invoice Management</Typography>
          <div className="flex gap-3">
            {/* Search Box */}
            <TextField
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="sending">Sending</MenuItem>
            </Select>
          </div>
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.invoice_id}</TableCell>
                    <TableCell>{invoice.order_id}</TableCell>
                    <TableCell>
                      {formatSnakeCase(invoice.orderDetails?.customerName) ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      ₹{invoice.orderDetails?.orderPrice || "0"}
                    </TableCell>
                    <TableCell>
                      {invoice.date
                        ? new Intl.DateTimeFormat("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(invoice.date))
                        : "Date not available"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatSnakeCase(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        <PictureAsPdf />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        <MailOutline />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        {/* Edit icon */}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteInvoice(invoice)}
                      >
                        {/* Delete icon */}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredInvoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Card>
  );
};

export default InvoiceManagement;
