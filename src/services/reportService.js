
import api from "./api";

const getReports = async (period, date) => {
    const response = await api.get("/reports", {
        params: {
            period,
            date
        }
    });

    return response.data;
};

export default {
    getReports
};
