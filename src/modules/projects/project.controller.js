import { Project } from "../../../db/models/projects.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";

//declare model so i can use populate
import "../../../db/models/user.model.js";
import "../../../db/models/task.model.js";

export const getAllProjects = catchError(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filterObj = {};
  if (req.user.role === "admin") {
    filterObj.admin = req.user.id;
  } else {
    filterObj.team = req.user.id;
  }

  const skip = (page - 1) * limit;
  const totalResults = await Project.countDocuments(filterObj);

  const projects = await Project.find(filterObj)
    .populate("admin", "name email")
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalResults / limit) || 1;

  res.status(200).json({
    message: "success",
    currentPage: page,
    totalPages: totalPages,
    totalResults: totalResults,
    data: projects,
  });
});

export const getProjectById = catchError(async (req, res, next) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("admin", "name email")
    .populate("team", "name email role")
    .populate({
      path: "tasks",
      select: "title  description status dueDate assignedUser",
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
    data: project,
  });
});
