import { Project } from "../../../db/models/projects.model.js";
import { User } from "../../../db/models/user.model.js";
import { Task } from "../../../db/models/task.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";
import { APIFeatures } from "../../utils/APIFeatures.js";

export const addProject = catchError(async (req, res, next) => {
  //validate the team members actually exist
  if (req.body.team && req.body.team.length > 0) {
    req.body.team = [...new Set(req.body.team)];
    const existingUsersCount = await User.countDocuments({
      _id: { $in: req.body.team },
    });
    if (existingUsersCount !== req.body.team.length) {
      return next(new AppError("One or more team members do not exist", 404));
    }
  }
  // title , description , adminId , team , tasks
  const project = new Project(req.body);

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
  // ownership Validation
  if (project.admin.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to modify this project", 403),
    );
  }

  // validate team members if they are updated
  if (req.body.team) {
    req.body.team = [...new Set(req.body.team)];
    const existingUsersCount = await User.countDocuments({
      _id: { $in: req.body.team },
    });
    if (existingUsersCount !== req.body.team.length) {
      return next(new AppError("One or more team members do not exist", 404));
    }
  }

  Object.assign(project, req.body);

  await project.save();

  res.status(200).json({
    status: "success",
    message: "project is updated successfully",
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
    .sort();

  const totalResults = await features.query.clone().countDocuments();

  features.paginate();

  const projects = await features.query
    .populate("admin", "name email")
    .populate("team", "name email");

  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  res.status(200).json({
    status: "success",
    results: projects.length,
    metadata: {
      currentPage: page,
      totalPages: totalPages,
      totalResults: totalResults,
      limit: limit,
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

  //ownership Validation
  if (project.admin.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to delete this project", 403),
    );
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "project is deleted successfully",
  });
});
