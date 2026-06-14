import { Task } from '../../../db/models/task.model.js';
import { Project } from '../../../db/models/projects.model.js';
import { User } from "../../../db/models/user.model.js";
import { catchError } from '../../middleWare/catchError.js';
import { AppError } from '../../utils/AppError.js';

export const createTask = catchError(async (req, res, next) => {
    const { project, assignedUser } = req.body;

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

    const task = await Task.create(req.body);


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

    res.status(200).json({
        task,
    });
});

export const getAllTasks = catchError(async (req, res, next) => {
    const filter = {};

    // 👑 admin sees everything
    if (req.user.role === "admin") {
        let filter = {};
    }
    // 👤 user sees only their assigned tasks
    else {
        filter.assignedUser = req.user._id;
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