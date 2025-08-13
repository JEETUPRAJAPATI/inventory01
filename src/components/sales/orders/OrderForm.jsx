import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import FormInput from "../../common/FormInput";
import FormSelect from "../../common/FormSelect";
import orderService from "/src/services/orderService.js";
import productionService from "/src/services/productionManagerService.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
const initialFormData = {
  customerName: "",
  email: "",
  address: "",
  mobileNumber: "",
  gstNo: "",
  contactPerson: "",
  jobName: "",
  fabricQuality: "",
  quantity: "",
  agent: "",
  orderPrice: "",
  status: "pending",
  bagDetails: {
    type: "",
    handleColor: "",
    size: "",
    color: "",
    printColor: "",
    gsm: "",
  },
};

const bagTypes = [
  { value: "d_cut_loop_handle", label: "Loop Handle (D-cut)" },
  { value: "w_cut_box_bag", label: "Box Bag (W-cut)" },
];

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderForm({ open, onClose, onSubmit, order = null }) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [editQuantity, setEditQuantity] = useState(true);
  const [mobileNumbers, setMobileNumbers] = useState([]);
  const navigate = useNavigate();
  const [bagAttributes, setBagAttributes] = useState({
    "bag-color": [],
    "fabric-quality": [],
    gsm: [],
    size: [],
    "handle-color": [],
  });

  useEffect(() => {
    const fetchMobileNumbers = async () => {
      try {
        const response = await orderService.getUsedMobileNumbers();
        if (response.success) {
          setMobileNumbers(response.data);
        }
      } catch (error) {
        toast.error("Error fetching mobile numbers");
      }
    };

    const handleViewFullDetails = async (orderId) => {
      try {
        const fullDetails = await productionService.getFullOrderDetails(
          orderId
        );
        setEditQuantity(fullDetails.data.production_manager !== null);
        console.log("fullDetails", fullDetails.data.production_manager);
      } catch (error) {
        console.error("Error fetching full details:", error);
      }
    };

    const initializeForm = () => {
      if (order) {
        handleViewFullDetails(order.orderId);
        setFormData({
          ...order,
          bagDetails: {
            type: order.bagDetails?.type || "",
            handleColor: order.bagDetails?.handleColor || "",
            size: order.bagDetails?.size || "",
            color: order.bagDetails?.color || "",
            printColor: order.bagDetails?.printColor || "",
            gsm: order.bagDetails?.gsm || "",
          },
        });
      } else {
        setFormData(initialFormData);
      }
    };

    fetchBagAttributes();
    fetchMobileNumbers();
    initializeForm();
  }, [order]);

  const fetchBagAttributes = async () => {
    try {
      const response = await orderService.getBagAttributes();
      console.log("response", response.data.gsm);
      if (response.success) {
        setBagAttributes(response.data);
      }
    } catch (error) {
      toast.error("Error fetching bag attributes");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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
          toast.error("Error fetching order details");
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          mobileNumber: newValue,
          customerName: "",
          email: "",
          address: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        mobileNumber: "",
        customerName: "",
        email: "",
        address: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { _id, orderId, createdAt, updatedAt, __v, ...orderDataWithoutId } =
      formData;
    console.log("orderDataWithoutId", orderDataWithoutId);
    // return false;
    try {
      if (order) {
        await orderService.updateOrder(order._id, orderDataWithoutId);
        toast.success("Order updated successfully!");
      } else {
        await orderService.createOrder(orderDataWithoutId);
        toast.success("Order created successfully!");
      }
      onSubmit(formData);
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      // Check if error response is available from server
      if (error.response) {
        const errorMessage =
          error.response.data.message || "Something went wrong";
        toast.error(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from server. Please try again later.");
      } else {
        // Some other error occurred
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const mobileOptions = mobileNumbers.map((number) => ({
    value: number,
    label: number,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          {order ? "Edit Order" : "Create New Order"}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Enter customer name"
                onKeyPress={(e) => {
                  const regex = /^[a-zA-Z\s]*$/;
                  if (!regex.test(e.key)) {
                    e.preventDefault(); // Block non-alphabet input
                  }
                }}
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
                  setFormData((prev) => ({
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
                    inputProps={{
                      ...params.inputProps,
                      maxLength: 10,
                      inputMode: "numeric",
                      onKeyPress: (e) => {
                        if (!/^[0-9]$/.test(e.key)) {
                          e.preventDefault(); // block non-numeric
                        }
                      },
                    }}
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
              <label className="text-sm">Email</label>
              <FormInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="text-sm"
                placeholder="Enter email"
              />
            </Grid>

            {/* GST No */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">GST No</label>
              <FormInput
                name="gstNo"
                type="text"
                value={formData.gstNo}
                onChange={handleChange}
                className="text-sm"
                placeholder="Enter GST number"
              />
            </Grid>

            {/* Contact Person Name */}
            <Grid item xs={12} md={6}>
              <label className="text-sm">Contact Person Name</label>
              <FormInput
                name="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={handleChange}
                className="text-sm"
                placeholder="Enter contact person name"
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
                disabled={order?.status === "completed"}
                className="text-sm"
              />
              {console.log("order", order?.status === "completed")}
            </Grid>

            <Grid item xs={12} md={6}>
              <label className="text-sm">Handle Color</label>
              <FormSelect
                name="bagDetails.handleColor"
                value={formData.bagDetails.handleColor}
                onChange={handleChange}
                options={
                  bagAttributes["handle-color"]?.map((v) => ({
                    label: v,
                    value: v,
                  })) || []
                }
                disabled={order?.status === "completed"}
                className="text-sm"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Size <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="bagDetails.size"
                value={formData.bagDetails.size}
                onChange={handleChange}
                options={
                  bagAttributes["size"]?.map((v) => ({ label: v, value: v })) ||
                  []
                }
                required
                disabled={order?.status === "completed"}
                className="text-sm"
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
                disabled={order?.status === "completed"}
                className="text-sm"
                placeholder="Job Name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Bag Color <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="bagDetails.color"
                value={formData.bagDetails.color}
                onChange={handleChange}
                options={
                  bagAttributes["bag-color"]?.map((v) => ({
                    label: v,
                    value: v,
                  })) || []
                }
                required
                disabled={order?.status === "completed"}
                className="text-sm"
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
                disabled={order?.status === "completed"}
                className="text-sm"
                placeholder="Print Color"
                onKeyDown={(e) => {
                  // Prevent number keys
                  if (e.key >= "0" && e.key <= "9") {
                    e.preventDefault();
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label className="text-sm">
                GSM <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="bagDetails.gsm"
                value={formData.bagDetails.gsm}
                disabled={order?.status === "completed"}
                onChange={handleChange}
                options={
                  bagAttributes["gsm"]?.map((v) => ({ label: v, value: v })) ||
                  []
                }
                required
                className="text-sm"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <label className="text-sm">
                Fabric Quality <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="fabricQuality"
                value={formData.fabricQuality}
                onChange={handleChange}
                disabled={order?.status === "completed"}
                options={
                  bagAttributes["fabric-quality"]?.map((v) => ({
                    label: v,
                    value: v,
                  })) || []
                }
                required
                className="text-sm"
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
                disabled={order?.status === "completed"}
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
                Rate <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="orderPrice"
                value={formData.orderPrice}
                onChange={handleChange}
                required
                type="number"
                className="text-sm"
                placeholder="Rate"
              />
            </Grid>
            <Grid item xs={12} md={6} className="hidden">
              <label className="text-sm">
                Status <span className="text-red-500">*</span>
              </label>
              <FormSelect
                name="status"
                value={formData.status || "Pending"}
                onChange={handleChange}
                options={orderStatuses}
                required
                className="text-sm"
                placeholder="Status"
              />
            </Grid>
            {/* Remarks */}
            <Grid item xs={12}>
              <label className="text-sm">Remarks</label>
              <FormInput
                name="remarks"
                type="text"
                value={formData.remarks}
                onChange={handleChange}
                className="text-sm"
                placeholder="Enter any remarks"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {order ? "Update" : "Create"} Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
