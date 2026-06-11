import { model, Schema , Types } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },
    project: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedUser: {
      type: Types.ObjectId,
      ref: "user",
    },

    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Due date cannot be in the past",
      },
    },
  },
  { timestamps: true, versionKey: false },
);

export const Task = model("Task", taskSchema);
