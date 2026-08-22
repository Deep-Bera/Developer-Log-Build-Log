import User from "../models/userModel.js";

export const userRegisterValidator = {
  name: {
    exists: {
      errorMessage: "Name field should be provided",
    },
    notEmpty: {
      errorMessage: "Name cannot be empty",
    },
    isLength: {
      options: {
        min: 2,
        max: 50,
      },
      errorMessage: "Name must be between 2 and 50 characters",
    },
    trim: true,
  },
  email: {
    exists: {
      errorMessage: "Email field should be provided",
    },
    notEmpty: {
      errorMessage: "Email cannot be empty",
    },
    isEmail: {
      errorMessage: "Enter a valid email address",
    },
    trim: true,
    normalizeEmail: true,
    custom: {
      options: async function (value) {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already exists, try a different one");
        }
        return true;
      },
    },
  },
  password: {
    exists: {
      errorMessage: "Password field should be provided",
    },
    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      },
      errorMessage:
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    },
    trim: true,
  },
};

export const userLoginValidator = {
  email: {
    exists: {
      errorMessage: "Email field should be provided",
    },
    notEmpty: {
      errorMessage: "Email cannot be empty",
    },
    isEmail: {
      errorMessage: "Enter a valid email address",
    },
    trim: true,
    normalizeEmail: true,
  },
  password: {
    exists: {
      errorMessage: "Password field should be provided",
    },
    notEmpty: {
      errorMessage: "Password cannot be empty",
    },
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      },
      errorMessage:
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    },
    trim: true,
  },
};
