const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlengh: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        //this only works on save and create
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    phoneNumber: {
      type: String,
      // required: [true, 'Please provide a phone number'],
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
