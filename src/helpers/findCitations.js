import axios from "axios";

export const findCitations = async (id, url) => {
    try {
        const response = await axios.post(`${url}/findCitations`, {
            id: id,
        });

        if (response.data) return response.data;
    } catch (err) {
        console.error(err);
    }

    return [[], []];
};
