import { User } from "../../../db/models/user.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";
import { APIFeatures } from "../../utils/APIFeatures.js";

// =============================================== add user by admin ===========================================
const createUser = catchError(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (role && !["user", "admin"].includes(role)) {
    return next(new AppError("Invalid role value provided", 400));
  }

  const newUser = await User.create({ name, email, password, role });
  
  const data = await User.findById(newUser._id).select("-password");

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data,
  });
});

// ===================================================== update user ===========================================
const updateUser = catchError(async (req, res, next) => {
  // Only admins can update user roles
  if (req.body.role) {
    return next(
      new AppError(
        "Role updates are restricted to administration permissions",
        403,
      ),
    );
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  // Regular users can only update themselves, admins can update anyone
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    return next(new AppError("You do not have permission to update this user", 403));
  }

  // Check email uniqueness if email is being updated
  if (req.body.email) {
    const existing = await User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.params.id } });
    if (existing) {
      return next(new AppError("Email already exists", 409));
    }
    user.email = req.body.email;
  }

  // Update properties
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.password = req.body.password;
  if (req.body.status) user.status = req.body.status;

  await user.save();

  // Return user without password
  const data = user.toObject();
  delete data.password;

  res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    data,
  });
});

// ===================================================== get user by id ==========================================
const getUser = catchError(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  
  res.status(200).json({
    status: "success",
    message: "User fetched successfully",
    data: user,
  });
});

// ===================================================== get all users ===========================================
const getAllUsers = catchError(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .search(["name", "email"])
    .sort()
    .limitFields();

  // Clone query to count documents BEFORE pagination is applied
  const totalResults = await features.query.clone().countDocuments();

  // Now apply pagination
  features.paginate();

  const users = await features.query.select("-password");

  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  res.status(200).json({
    status: "success",
    message: "Users fetched successfully",
    results: users.length,
    metadata: {
      currentPage: page,
      totalPages: totalPages,
      totalResults: totalResults,
    },
    data: users,
  });
});

// ===================================================== delete user ===========================================
const deleteUser = catchError(async (req, res, next) => {
  // Prevent self-deletion
  if (req.params.id === req.user.id) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User profile not found", 404));

  res.status(200).json({
    status: "success",
    message: "User profile deleted successfully",
  });
});

const getMe = catchError(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Profile fetched successfully",
    data: req.user,
  });
});

export { getUser, createUser, getAllUsers, deleteUser, updateUser, getMe };

