import api from './api';

const API_BASE_URL = '/wcut/flexo';

const OrderService = {
    // 1. List all orders
    listOrders: async (status) => {
        try {
            const response = await api.get(`${API_BASE_URL}?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    listMaterials: async (orderId) => {
        try {
            const response = await api.get(`${API_BASE_URL}/${orderId}/listMaterials`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    // 2. Verification API
    verifyOrder: async (orderId, materialId, scanData) => {
        try {
            const response = await api.post(`${API_BASE_URL}/${orderId}/verify`, { materialId, scanData });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // 3. Status update API
    updateOrderStatus: async (orderId, status, remarks, unitToUpdate) => {
        try {
            const response = await api.put(`${API_BASE_URL}/${orderId}`, {
                status,
                remarks,
                unitToUpdate
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // 4. Direct billing API
    directBilling: async (orderId, bagType) => {
        try {
            // Include scrapValue in the body as well if backend expects it
            const response = await api.put(
                `${API_BASE_URL}/${orderId}/billing`,
                {
                    billingStatus: 'completed',
                    type: bagType,
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    // 5. Move to delivery API
    moveToBagMaking: async (orderId) => {
        try {
            const response = await api.put(`${API_BASE_URL}/${orderId}/bag_making`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
};

export default OrderService;
