
import api from "./api";

const getPayments = async (params = {}) => {
    const response = await api.get("/payments", { params });
    return response.data;
};

const getPaymentById = async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
};

const createPayment = async (paymentData) => {
    const response = await api.post("/payments", paymentData);
    return response.data;
};

const updatePaymentStatus = async (id, status) => {
    const response = await api.patch(`/payments/${id}/status`, {
        status
    });

    return response.data;
};

export default {
    getPayments,
    getPaymentById,
    createPayment,
    updatePaymentStatus
};
