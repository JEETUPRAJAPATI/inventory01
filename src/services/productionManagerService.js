import api from "./api";

const WCUT_API_URL = "/production/manager/wcut/bagmaking";
const DCUT_API_URL = "/production/manager/dcut/bagmaking";

// Fetch all orders with pagination and filtering
const getWcutOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await api.get(
      `${WCUT_API_URL}?page=${page}&limit=${limit}`,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching W-Cut orders"
    );
  }
};

const getDcutOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await api.get(
      `${DCUT_API_URL}?page=${page}&limit=${limit}`,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching D-Cut orders"
    );
  }
};
const getProductionRecord = async (orderId) => {
  try {
    const response = await api.get(`/production/manager/get/${orderId}`);
    return response.data.data.production_manager; // assuming production_manager is the data you need
  } catch (error) {
    throw new Error("Error fetching production record: " + error.message);
  }
};

const updateProductionRecord = async (data, order_id) => {
  const response = await api.put(`/production/manager/update/${order_id}`, {
    ...data,
    order_id, // Pass the order_id as part of the request
  });
  return response.data;
};

const getFullOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/production/manager/view/${orderId}`);
    console.log("response data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching full order details:", error);
    throw error;
  }
};
// W-Cut Production Management
const getWCutFlexo = async (params) => {
  try {
    const response = await api.get("production/manager/w-cut/flexo", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch W-Cut Flexo data"
    );
  }
};

const getWCutBagMaking = async (params) => {
  try {
    const response = await api.get("production/manager/w-cut/bag-making", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch W-Cut Bag Making data"
    );
  }
};

// D-Cut Production Management
const getDCutOpsert = async (params) => {
  try {
    const response = await api.get("production/manager/d-cut/opsert", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch D-Cut Opsert data"
    );
  }
};

const getDCutBagMaking = async (params) => {
  try {
    const response = await api.get("production/manager/d-cut/bag-making", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch D-Cut Bag Making data"
    );
  }
};

// Counter List Production Manager
const getFlexoCounter = async (params) => {
  try {
    const response = await api.get("production/manager/w-cut/flexo-counter", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch W-Cut Flexo data"
    );
  }
};

const getWCutBagMakingCounter = async (params) => {
  try {
    const response = await api.get(
      "production/manager/w-cut/bag-making-counter",
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch W-Cut Bag Making data"
    );
  }
};

// D-Cut Production Management
const getDCutOpsertCounter = async (params) => {
  try {
    const response = await api.get("production/manager/d-cut/opsert-counter", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch D-Cut Opsert data"
    );
  }
};

const getDCutBagMakingCounter = async (params) => {
  try {
    const response = await api.get(
      "production/manager/d-cut/bag-making-counter",
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch D-Cut Bag Making data"
    );
  }
};

export default {
  getWcutOrders,
  getDcutOrders,
  updateProductionRecord,
  getProductionRecord,
  getWCutFlexo,
  getWCutBagMaking,
  getDCutOpsert,
  getDCutBagMaking,
  getFullOrderDetails,
  getFlexoCounter,
  getWCutBagMakingCounter,
  getDCutOpsertCounter,
  getDCutBagMakingCounter,
};
