import Task from "../model/taskModel.js";

// Get all tasks for a user
export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
};

// Create new task
export const createTask = async (req, res) => {
  const { title, description } = req.body;
  const task = await Task.create({
    userId: req.userId,
    title,
    description,
    completed: false,
  });
  res.status(201).json(task);
};

// Update task
export const updateTask = async (req, res) => {
  try {
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
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
