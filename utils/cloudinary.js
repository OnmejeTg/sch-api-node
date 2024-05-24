import { v2 as cloudinary } from "cloudinary";
import mime from "mime-types";

import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadImage = async (imageBuffer, folder) => {
  const mimeType = mime.lookup(imageBuffer) || "image/jpeg"; // Determine MIME type
  const base64Image = imageBuffer.toString("base64"); // Convert buffer to base64 string
  const dataUri = `data:${mimeType};base64,${base64Image}`; // Create data URI

  try {
    const result = await cloudinary.uploader.upload(dataUri, { folder });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Error uploading image to Cloudinary: ${error.message}`);
  }
};

export { cloudinary, uploadImage };
