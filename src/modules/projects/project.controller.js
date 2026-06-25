import { Project } from "../../../db/models/projects.model.js";
import { catchError } from "../../middleWare/catchError.js";
import { AppError } from "../../utils/AppError.js";

//declare model so i can use populate
import "../../../db/models/user.model.js";
import "../../../db/models/task.model.js";


export const addProject = catchError(async(req,res,next)=>{

  // title , description , adminId , team , tasks

  const project = await new Project(req.body);

  await project.save()

  res.status(200).json({message:" project is created successfully", data: project})

})


export const updateProject = catchError(async(req,res,next)=>{


  const project = await Project.findById(req.params.id)

if(!project) return res.status(404).json({message : "project not found"}) 

// next(new AppError("project is not founded" , 400))

  Object.assign (project, req.body)

  await project.save();

  res.status(200).json({message:" project is updated successfully", data : project})

})


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

// console.log(req.user);
// console.log(await Project.find());
// console.log(filterObj);

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

export const deleteProject = catchError(async(req,res,next)=>{


  const project = await Project.findByIdAndDelete(req.params.id)

if(!project) return next(new AppError("project is not founded" , 400))


  res.status(200).json({message:" project is deleted"})

})
