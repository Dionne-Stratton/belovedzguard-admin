import api from "./api.js";

export const presignUpload = async (assetType, fileName) => {
  const response = await api.post("/uploads/presign", {
    assetType,
    fileName,
  });
  return response.data;
};
