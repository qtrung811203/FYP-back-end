const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdCloudinary = (cloudUrl) => {
  const [, , , , , , , folder, fileNameWithExt] = cloudUrl.split('/');
  const fileName = fileNameWithExt.split('.')[0];
  return `${folder}/${fileName}`;
};

const deleteImgCloudinary = async (imgCoverUrl) => {
  const imgCoverId = getPublicIdCloudinary(imgCoverUrl);
  await cloudinary.uploader.destroy(imgCoverId);
};

module.exports = { getPublicIdCloudinary, deleteImgCloudinary, cloudinary };
