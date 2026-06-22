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

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("E-mail already exists", 409)); // 409 Conflict status
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
  if (req.body.role) {
    return next(
      new AppError(
        "Role updates are restricted to administration permissions",
        403,
      ),
    );
  }
  // destructure
  const updatedData = {};
  if (req.body.name) updatedData.name = req.body.name;
  if (req.body.email) updatedData.email = req.body.email;
  if (req.body.password) updatedData.password = req.body.password;
  if (req.body.role) updatedData.role = req.body.role;
  if (req.body.status) updatedData.status = req.body.status;

  // update data
  const data = await User.findByIdAndUpdate(req.params.id, updatedData, {
    returnDocument: "after",
  }).select("-password");

  if (!data) return next(new AppError("User not found", 404));

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
    .sort();

  const totalResults = await features.query.clone().countDocuments();

  features.paginate();

  const users = await features.query.select("-password");

  if (!users) {
    return next(new AppError("Something went wrong while fetching users", 500));
  }

  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  res.status(200).json({
    status: "success",
    results: users.length,
    metadata: {
      currentPage: page,
      totalPages: totalPages,
      totalResults: totalResults,
      limit: limit,
    },
    data: users,
  });
});

// ===================================================== delete user ===========================================
const deleteUser = catchError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User profile not found", 404));

  res.status(200).json({
    status: "success",
    message: "User profile deleted successfully",
  });
});

export { getUser, createUser, getAllUsers, deleteUser, updateUser };
