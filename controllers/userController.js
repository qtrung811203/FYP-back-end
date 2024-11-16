const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const cloudinary = require('../services/cloudinaryConfig');
const { uploadImageUser } = require('../services/multerConfig');

//MIDDLEWARE
// User Upload
exports.uploadImageUser = uploadImageUser.single('image');

// HELPER FUNCTIONS
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const excludedField = (obj, ...excludedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!excludedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getPublicIdCloudinary = (cloudUrl) => {
  const [, , , , , , , folder, fileNameWithExt] = cloudUrl.split('/');
  const fileName = fileNameWithExt.split('.')[0];
  return `${folder}/${fileName}`;
};

// FOR ADMIN & MANAGER//
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const excludedBody = excludedField(req.body, 'password');
  const id = req.params.id;
  const updateUser = await User.findByIdAndUpdate(id, excludedBody, {
    new: true,
    runValidators: true,
  });
  if (!updateUser) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  //remove image from cloudinary
  const result = getPublicIdCloudinary(user.image);
  if (result !== 'users/user_default')
    await cloudinary.uploader.destroy(result);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// FOR LOGGED IN USER //
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 - create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }
  // 2 - update user document
  const filteredBody = filterObj(req.body, 'name', 'phoneNumber', 'address');

  // 3 - update image
  if (req.file) {
    filteredBody.image = req.file.path;
    //remove old image from cloudinary
    const result = getPublicIdCloudinary(req.user.image);
    if (result !== 'users/user_default')
      await cloudinary.uploader.destroy(result);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
