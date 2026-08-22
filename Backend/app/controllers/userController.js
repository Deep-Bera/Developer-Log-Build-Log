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
  // console.log(id);

  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(200).json({ error: "No user found " });
    }
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

userController.updateUserDetails = async (req, res) => {
  const { name, email, bio } = req.body;
  const id = req.userId;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name: name, email: email, bio: bio },
      { returnDocument: "after" },
    );
    res.status(200).json({
      UserData: {
        name: user.name,
        email: user.email,
        userId: user._id,
        role: user.role,
      },
      message: "Successfully Updated the Data",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export default userController;
