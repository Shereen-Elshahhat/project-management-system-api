import { UserModel } from "../models/user.model.js";

const users = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    status: "active"
  },
  {
    username: "user1",
    email: "user@example.com",
    password: "password123",
    role: "user",
    status: "active"
  }
];

export const seedUsers = async () => {
  // * Uncomment this line if you want to clear existing data
  // await UserModel.deleteMany({});
  await UserModel.insertMany(users);
  console.log("Users seeded successfully.");
};