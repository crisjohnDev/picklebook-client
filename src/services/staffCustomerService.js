
import api from "./api";

// ==========================================
// GET CUSTOMER LIST
// ==========================================

const getCustomers = async (params = {}) => {
    const response = await api.get("/staff/customers", {
        params
    });

    return response.data;
};

// ==========================================
// GET CUSTOMER PROFILE AND BOOKING HISTORY
// ==========================================

const getCustomerProfile = async (customerId) => {
    const response = await api.get(`/staff/customers/${customerId}`);

    return response.data;
};

export default {
    getCustomers,
    getCustomerProfile
};
