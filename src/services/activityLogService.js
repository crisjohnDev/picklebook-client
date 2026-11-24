
import api from "./api";

// ==========================================
// ACTIVITY LOG SERVICE
// Handles all activity log API requests
// ==========================================

const activityLogService = {

    // Get activity logs with pagination and filters
    getActivities: async (params = {}) => {
        const response = await api.get("/activity-logs", {
            params
        });

        return response.data;
    },

    // Get recent activities
    getRecentActivities: async (limit = 5) => {
        const response = await api.get("/activity-logs", {
            params: {
                page: 1,
                limit
            }
        });

        return response.data;
    }

};

export default activityLogService;
