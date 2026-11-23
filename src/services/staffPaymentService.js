
import api from "./api";

// ==========================================
// STAFF PAYMENT API
// ==========================================

const getPayments = async (params = {}) => {
    const response = await api.get("/staff/payments", {
        params
    });

    return response.data;
};

const getUnpaidReservations = async () => {
    const response = await api.get(
        "/staff/payments/unpaid-reservations"
    );

    return response.data;
};

const createPayment = async (paymentData) => {
    const response = await api.post(
        "/staff/payments",
        paymentData
    );

    return response.data;
};

export default {
    getPayments,
    getUnpaidReservations,
    createPayment
};
