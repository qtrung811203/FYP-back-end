const multer = require('multer');
const { cloudinary } = require('./cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// User Upload
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'users',
      allowedFormats: ['jpg', 'png'],
      public_id: `user_${req.user.id}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

// Product Upload
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'products',
      allowedFormats: ['jpg', 'png'],
      public_id: `product_${req.user.id}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

// Item Upload
const itemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'items',
      allowedFormats: ['jpg', 'png'],
      public_id: `item_${req.user.id}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

const uploadImageUser = multer({ storage: userStorage });
const uploadImageProduct = multer({ storage: productStorage });
const uploadImageItem = multer({ storage: itemStorage });
module.exports = { uploadImageUser, uploadImageProduct, uploadImageItem };
