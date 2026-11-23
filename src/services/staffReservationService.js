
import api from "./api";

// ==========================================
// STAFF RESERVATION SERVICE
// ==========================================

const getReservations = async (params = {}) => {
    const response = await api.get("/staff/reservations", {
        params
    });

    return response.data;
};

export default {
    getReservations
};
