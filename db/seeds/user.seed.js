import { User } from "../models/user.model.js";

const users = [
  {
    name: "admin",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
    status: "active"
  },
  {
    name: "user1",
    email: "user@example.com",
    password: "Password123",
    role: "user",
    status: "active"
  }
];

export const seedUsers = async () => {
  // Clear existing users to avoid duplicate email/key violations
  await User.deleteMany({});
  
  // Use User.create so pre-save password hashing hook is executed
  await User.create(users);
  console.log("Users seeded successfully.");
};