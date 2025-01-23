// Σύνδεση με την βάση δεδομένων
import mongoose from "mongoose";

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  console.log("Database Connection: There is not open database connection");
  try {
    await mongoose.connect(process.env.DB_URI, {});
    console.log("dbConnect: Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB. File: dbConnect - Function: dbConnect", error);
  }
};

export default dbConnect;
