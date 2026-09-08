import User from "../models/userModel.js";
import { validationResult } from "express-validator";
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
const userController = {};

userController.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  // console.log(name, email, password);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = new User({ email, password, name });
    const salt = await bcryptjs.genSalt();
    const hash = await bcryptjs.hash(password, salt);
    user.password = hash;
    const countUser = await User.countDocuments();
    if (countUser == 0) {
      user.role = "admin";
    }
    await user.save();
    res.status(201).json({
      data: { userId: user._id, email: email, role: user.role },
      message: "Successfully Registered to BuildLog_AI",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Something went wrong");
  }
};

userController.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        errors: [{ path: "email", msg: "No account found with this email" }], // passes the response like this so that in FE we can use the getError function
      });
    }

    const passCompare = await bcryptjs.compare(password, user.password);
    if (!passCompare) {
      return res.status(401).json({
        errors: [{ path: "password", msg: "Incorrect password, try again" }],
      });
    }

    const tokenData = { userId: user._id, role: user.role };
    const token = jwt.sign(tokenData, process.env.SECRET_TOKEN_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      message: "Welcome to Build Log AI",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

userController.userDetails = async (req, res) => {
  const id = req.userId;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    res.status(200).json({
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

userController.updateUserDetails = async (req, res) => {
  const { name, email, bio, phone } = req.body;
  const id = req.userId;

  try {
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;

    // if a file was uploaded, cloudinary url comes from multer..
    if (req.file?.path) {
      updateFields.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        userId: user._id,
        role: user.role,
      },
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default userController;
