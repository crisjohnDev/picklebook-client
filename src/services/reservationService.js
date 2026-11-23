
import api from "./api";

// Retrieve reservations with optional filters
const getReservations = async (params = {}) => {
    const response = await api.get("/reservations", { params });
    return response.data;
};

// Retrieve one reservation
const getReservationById = async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
};

// Create reservation
const createReservation = async (reservationData) => {
    const response = await api.post("/reservations", reservationData);
    return response.data;
};

// Update reservation details
const updateReservation = async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
};

// Update reservation status
const updateReservationStatus = async (id, status) => {
    const response = await api.patch(`/reservations/${id}/status`, {
        status
    });

    return response.data;
};

export default {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    updateReservationStatus
};
