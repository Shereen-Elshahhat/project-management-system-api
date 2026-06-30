import { Task } from '../../../db/models/task.model.js';
import { Project } from '../../../db/models/projects.model.js';
import { User } from "../../../db/models/user.model.js";
import { catchError } from '../../middleWare/catchError.js';
import { AppError } from '../../utils/AppError.js';

export const createTask = catchError(async (req, res, next) => {
    const { project, assignedUser } = req.body;

    // check if admin
    if (req.user.role !== "admin") {
        return next(new AppError("You are not authorized to create a task", 403));
    };
    const projectExists = await Project.findById(project);
    if (!projectExists) {
        return next(new AppError("Project not found", 404));
    }
    if (assignedUser) {
        const userExists = await User.findById(assignedUser);
        if (!userExists) {
            return next(new AppError("Assigned user not found", 404));
        }
    }
    // check if user belongs to project team
    const isAssignedUserMember = projectExists.team.some(
    member => member.toString() === assignedUser
    );
    if (!isAssignedUserMember) {
        return next(
            new AppError("Assigned user is not a member of this project", 400)
        );
    };

    const task = await Task.create(
        project, 
        assignedUser
    );


    const populatedTask = await Task.findById(task._id)
        .populate("project", "title description")
        .populate("assignedUser", "name email role");

    res.status(201).json({
        message: "Task created successfully",
        task: populatedTask,
    });
});

export const getTaskById = catchError(async (req, res, next) => {
    const { id } = req.params;

    const task = await Task.findById(id)
        .populate('project')
        .populate('assignedUser');

    if (!task) {
        return next(new AppError('Task not found', 404));
    }
    // check if user is owner or admin
    const isOwner = task.assignedUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "Not authorized to update this task",
        });
    };

    res.status(200).json({
        task,
    });
});

export const getAllTasks = catchError(async (req, res, next) => {
    const filter = {};

    // 👑 only admin sees everything
    if (req.user.role !== "admin") {
        filter.assignedUser = req.user.id;
    }

    const tasks = await Task.find(filter)
        .populate({
            path: "project",
            select: "title description admin",
        })
        .populate({
            path: "assignedUser",
            select: "name email role",
        });

    res.status(200).json({
        count: tasks.length,
        tasks,
    });
});

// ==================================== update task ==============================================
export const updateTask = catchError(async(req,res,next)=>{
    const { title, description, assignedUser, dueDate, status } = req.body;
    const updatedData = {};
    if(title !== undefined) updatedData.title = title;
    if(description !== undefined) updatedData.description = description;
    if(assignedUser !== undefined) updatedData.assignedUser = assignedUser;
    if(dueDate !== undefined) updatedData.dueDate = dueDate;
    if(status !== undefined) updatedData.status = status;
    // update data
    const task = await Task.findById(req.params.id);
    if(!task) return next(new AppError("Task not found",404));
    // check if project exists
    const project = await Project.findById(task.project);
    if (!project) {
        return next(new AppError("Project not found", 404));
    }
    // check if user is owner or admin
    const isOwner = task.assignedUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "Not authorized to update this task",
        });
    };
    // update
    await task.updateOne(updatedData);
    const updatedTask = await Task.findById(task._id)
        .populate("project", "title description")
        .populate("assignedUser", "name email role");
    // send response
    res.status(200).json({message:"Task updated successfully", data : updatedTask});
});

// ======================================= delete task ============================================
export const deleteTask = catchError(async(req,res,next)=>{
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
        return next(new AppError("Task not found",404));
    };
    // check if user is owner or admin
    const isOwner = task.assignedUser.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "Not authorized to update this task",
        });
    };
    // delete
    await Task.findByIdAndDelete(id);
    res.status(200).json({message: "Task deleted successfully"});
});