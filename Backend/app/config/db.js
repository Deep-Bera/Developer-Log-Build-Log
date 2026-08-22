import mongoose from "mongoose";
const configDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Server connected to DB project_db_final");
  } catch (error) {
    console.log("Connection failed for ", error.message);
  }
};
export default configDB;
