
import api from "./api";

// ==========================================
// GET ALL ADMIN AND STAFF USERS
// ==========================================

const getUsers = async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
};

// ==========================================
// GET SINGLE USER
// ==========================================

const getUserById = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

// ==========================================
// CREATE USER
// ==========================================

const createUser = async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
};

// ==========================================
// UPDATE USER
// ==========================================

const updateUser = async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};

// ==========================================
// CHANGE USER PASSWORD
// ==========================================

const changeUserPassword = async (id, password) => {
    const response = await api.patch(`/admin/users/${id}/password`, {
        password
    });

    return response.data;
};

// ==========================================
// ACTIVATE / DEACTIVATE USER
// ==========================================

const updateUserStatus = async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, {
        isActive
    });

    return response.data;
};

// ==========================================
// EXPORT SERVICE
// ==========================================

const userManagementService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    changeUserPassword,
    updateUserStatus
};

export default userManagementService;
