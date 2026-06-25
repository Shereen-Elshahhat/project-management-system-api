import { User } from "../models/user.model.js";

const users = [
  {
    name: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    status: "active"
  },
  {
    name: "user1",
    email: "user@example.com",
    password: "password123",
    role: "user",
    status: "active"
  }
];

export const seedUsers = async () => {
  if (process.env.NODE_ENV !== "development") {
    console.error("User seeding aborted: Environment is not development.");
    return;
  }
  // Safe clearance in development environment
  await User.deleteMany({});
  await User.insertMany(users);
  console.log("Users seeded successfully.");
};