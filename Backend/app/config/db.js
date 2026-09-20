import mongoose from "mongoose";

let cachedConnection = null;

const configDB = async () => {
  if (cachedConnection) return cachedConnection; // if already connected, reuse it..

  try {
    cachedConnection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Server connected to DB project_db_final");
    return cachedConnection;
  } catch (error) {
    console.log("Connection failed for ", error.message);
  }
};

export default configDB;