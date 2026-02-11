const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
  try {
    const fs = require('fs');
    // Read file and convert to Base64 to avoid stream/path issues on Windows
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = filePath.split('.').pop(); // Simple MIME detection
    const base64Image = `data:image/${mimeType};base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "Edchatflow",
      resource_type: "auto",
      timeout: 120000 // 120 seconds
    });

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    const fs = require('fs');
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};

module.exports = { cloudinary, uploadImage };
