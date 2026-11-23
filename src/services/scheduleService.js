
import api from "./api";

const getSchedule = async (courtId, date) => {
    const response = await api.get("/reservations/schedule", {
        params: {
            courtId,
            date
        }
    });

    return response.data;
};

export default {
    getSchedule
};
