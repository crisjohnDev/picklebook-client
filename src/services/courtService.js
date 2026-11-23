
import api from "./api";

const getCourts = async (params = {}) => {
    const response = await api.get("/courts", { params });
    return response.data;
};

const getCourtById = async (id) => {
    const response = await api.get(`/courts/${id}`);
    return response.data;
};

const createCourt = async (courtData) => {
    const response = await api.post("/courts", courtData);
    return response.data;
};

const updateCourt = async (id, courtData) => {
    const response = await api.put(`/courts/${id}`, courtData);
    return response.data;
};

const updateCourtStatus = async (id, isActive) => {
    const response = await api.patch(`/courts/${id}/status`, {
        isActive
    });
    return response.data;
};

const courtService = {
    getCourts,
    getCourtById,
    createCourt,
    updateCourt,
    updateCourtStatus
};

export default courtService;
