import { Project } from "../../../db/models/projects.model.js";
import { User } from "../../../db/models/user.model.js";
import { Task } from "../../../db/models/task.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";
import { APIFeatures } from "../../utils/APIFeatures.js";
import mongoose from "mongoose";

// Reusable helper function for team members validation (Issue 4)
export const validateTeamMembers = async (team) => {
  if (!team || team.length === 0) return [];
  const uniqueTeam = [...new Set(team)];
  const existingUsersCount = await User.countDocuments({
    _id: { $in: uniqueTeam },
  });
  if (existingUsersCount !== uniqueTeam.length) {
    throw new AppError("One or more team members do not exist", 404);
  }
  return uniqueTeam;
};

export const addProject = catchError(async (req, res, next) => {
  // Verify that the authenticated admin user exists in DB (Issue 2)
  const adminUser = await User.findById(req.user.id);
  if (!adminUser) {
    return next(new AppError("Admin user not found", 404));
  }

  // Validate team members if provided
  if (req.body.team) {
    req.body.team = await validateTeamMembers(req.body.team);
  }

  // Set the admin from the authenticated user (Issue 1)
  const project = new Project({
    ...req.body,
    admin: req.user.id,
  });

  await project.save();

  res.status(201).json({
    status: "success",
    message: "Project created successfully",
    data: project,
  });
});

export const updateProject = catchError(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError("Project not found", 404));
  
  // Ownership Validation
  if (project.admin.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to modify this project", 403),
    );
  }

  // Validate team members if updated (Issue 4)
  if (req.body.team) {
    req.body.team = await validateTeamMembers(req.body.team);
  }

  Object.assign(project, req.body);
  await project.save();

  res.status(200).json({
    status: "success",
    message: "Project is updated successfully",
    data: project,
  });
});

export const getAllProjects = catchError(async (req, res, next) => {
  // Base filter: check admin or developers in the projects
  const filterObj = {};
  if (req.user.role === "admin") {
    filterObj.admin = req.user.id;
  } else {
    filterObj.team = req.user.id;
  }

  const features = new APIFeatures(Project.find(filterObj), req.query)
    .filter()
    .search(["title", "description"])
    .sort()
    .limitFields();

  // Clone count BEFORE pagination (Issue 6)
  const totalResults = await features.query.clone().countDocuments();

  // Apply pagination
  features.paginate();

  const projects = await features.query
    .populate("admin", "name email")
    .populate("team", "name email");

  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  res.status(200).json({
    status: "success",
    message: "Projects fetched successfully",
    metadata: {
      currentPage: page,
      totalPages: totalPages,
      totalResults: totalResults,
    },
    data: projects,
  });
});

export const getProjectById = catchError(async (req, res, next) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("admin", "name email")
    .populate("team", "name email role status")
    .populate({
      path: "tasks",
      select: "title description status dueDate assignedUser",
      populate: {
        path: "assignedUser",
        select: "name email",
      },
    });

  if (!project) {
    return next(new AppError("Project not found", 404));
  }

  const isAdmin = project.admin._id.toString() === req.user.id;
  const isTeamMember = project.team.some(
    (member) => member._id.toString() === req.user.id,
  );

  if (!isAdmin && !isTeamMember) {
    return next(
      new AppError("You do not have permission to view this project", 403),
    );
  }

  res.status(200).json({
    status: "success",
    message: "Project fetched successfully",
    data: project,
  });
});

export const deleteProject = catchError(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError("Project not found", 404));

  // Ownership Validation
  if (project.admin.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to delete this project", 403),
    );
  }

  // Use MongoDB transaction to cascade delete tasks (Issue 3, 23)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Delete all related tasks
    await Task.deleteMany({ project: project._id }).session(session);
    // Delete the project
    await Project.findByIdAndDelete(req.params.id).session(session);
    
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }

  res.status(200).json({
    status: "success",
    message: "Project and its related tasks deleted successfully",
  });
});
