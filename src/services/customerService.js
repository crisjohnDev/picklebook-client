
import api from "./api";

// GET CUSTOMERS WITH SEARCH, FILTERS, AND PAGINATION
const getCustomers = async (params = {}) => {
    const response = await api.get("/customers", { params });
    return response.data;
};

// GET CUSTOMER PROFILE AND BOOKING HISTORY
const getCustomerById = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

// ACTIVATE OR DEACTIVATE CUSTOMER
const updateCustomerStatus = async (id, isActive) => {
    const response = await api.patch(`/customers/${id}/status`, {
        isActive
    });

    return response.data;
};

export default {
    getCustomers,
    getCustomerById,
    updateCustomerStatus
};
