import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    description: String,
    completed: { type: Boolean, default: false },
    dueDate: { type: Number, required: false },
    listName: { type: String, default: "My Task List" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    order: { type: Number, default: 0 },
    starred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
