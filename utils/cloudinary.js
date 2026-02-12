const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error("No file buffer provided");
    }

    // Convert buffer to Base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "Edchatflow",
      resource_type: "auto",
      timeout: 120000 // 120 seconds
    });

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { cloudinary, uploadImage };
