
import api from "./api";

// ==========================================
// GET CURRENT ACCOUNT
// ==========================================

const getMyAccount = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (profileData) => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (passwordData) => {
    const response = await api.put(
        "/auth/change-password",
        passwordData
    );

    return response.data;
};

const accountService = {
    getMyAccount,
    updateProfile,
    changePassword
};

export default accountService;
