import mongoose from "mongoose";
import { seedUsers } from "./user.seed.js";

const runSeeder = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project-management");
    console.log("Database connected for seeding...");

    // Run seeders
    await seedUsers();

    console.log("All seeding completed successfully.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seeding failed:", error);
  }
};

runSeeder();