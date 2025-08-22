import api from "./api";

const deliveryService = {
  createDriver: async (driverData) => {
    try {
      const response = await api.post("/driver/create-driver", driverData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create driver"
      );
    }
  },

  // Read/List drivers (with optional pagination)
  getDrivers: async () => {
    try {
      const response = await api.get("/driver/read-driver");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch drivers"
      );
    }
  },
  updateDriver: async (id, driverData) => {
    try {
      const response = await api.put(`/driver/update-driver/${id}`, driverData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update driver"
      );
    }
  },
  // Get all deliveries with filters
  getDeliveries: async (params) => {
    try {
      const response = await api.get("/delivery", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch deliveries"
      );
    }
  },

  // Get single delivery by ID
  getDeliveryById: async (id) => {
    try {
      const response = await api.get(`/delivery/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch delivery details"
      );
    }
  },
  updateDelivery: async (id, updatedDetails) => {
    try {
      const response = await api.put(`/delivery/${id}`, updatedDetails);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update delivery"
      );
    }
  },

  // Update delivery status
  updateDeliveryStatus: async (id, status) => {
    try {
      const response = await api.put(`/delivery/${id}`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update delivery status"
      );
    }
  },
};

export default deliveryService;
