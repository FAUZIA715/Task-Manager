import Task from "../model/taskModel.js";

// Get all tasks for a user, optionally filtered by listName
export const getTasks = async (req, res) => {
  const { listName = "My Task List" } = req.query;
  const tasks = await Task.find({ userId: req.userId, listName });
  res.json(tasks);
};

// Create new task
export const createTask = async (req, res) => {
  const { title, description, dueDate, listName = "My Task List" } = req.body;
  const task = await Task.create({
    userId: req.userId,
    title,
    description,
    completed: false,
    dueDate,
    listName,
  });
  res.status(201).json(task);
};

// Update task
export const updateTask = async (req, res) => {
  try {
    // Find the task and check ownership
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    // Find the task and check ownership
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
