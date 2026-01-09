import api from "./api";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };

    const response = await api.post("/upload", formData, config);
    return response.data; // Should return the file path/URL
};
