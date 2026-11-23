
import api from "./api";

// ==========================================
// GET STAFF DASHBOARD DATA
// ==========================================
const getDashboard = async () => {
    const response = await api.get("/dashboard/staff");
    return response.data;
};

export default {
    getDashboard
};
