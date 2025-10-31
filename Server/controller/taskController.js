import Task from "../model/taskModel.js";

// Get all tasks for a user, optionally filtered by listName
export const getTasks = async (req, res) => {
  const { listName = "My Task List" } = req.query;
  const tasks = await Task.find({ userId: req.userId, listName }).sort({
    order: 1,
  });
  res.json(tasks);
};

// Get starred tasks for a user
export const getStarredTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.userId, starred: true }).sort({
    order: 1,
  });
  res.json(tasks);
};

// Create new task
export const createTask = async (req, res) => {
  const {
    title,
    description,
    dueDate,
    listName = "My Task List",
    parentId,
  } = req.body;

  // Determine the order for the new task
  let order = 0;
  if (parentId) {
    // For subtasks, find the max order among siblings
    const siblings = await Task.find({ parentId, userId: req.userId });
    order =
      siblings.length > 0
        ? Math.max(...siblings.map((s) => s.order || 0)) + 1
        : 0;
  } else {
    // For root tasks, find the max order among root tasks in the list
    const rootTasks = await Task.find({
      parentId: null,
      userId: req.userId,
      listName,
    });
    order =
      rootTasks.length > 0
        ? Math.max(...rootTasks.map((t) => t.order || 0)) + 1
        : 0;
  }

  const task = await Task.create({
    userId: req.userId,
    title,
    description,
    completed: false,
    dueDate,
    listName,
    parentId,
    order,
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

    const updates = req.body;
    const newCompleted = updates.completed;
    const wasCompleted = task.completed;

    // Update the task
    const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    // Handle completion logic for hierarchy
    if (newCompleted !== wasCompleted && typeof newCompleted === "boolean") {
      if (task.parentId) {
        // Subtask
        const parent = await Task.findById(task.parentId);
        if (parent && parent.userId === req.userId) {
          if (newCompleted) {
            // Completing subtask: check if all siblings are completed
            const siblings = await Task.find({
              parentId: task.parentId,
              userId: req.userId,
            });
            const allCompleted = siblings.every((s) => s.completed);
            if (allCompleted) {
              await Task.findByIdAndUpdate(parent._id, { completed: true });
            }
          } else {
            // Uncompleting subtask: uncomplete parent
            await Task.findByIdAndUpdate(parent._id, { completed: false });
          }
        }
      } else {
        // Parent task
        if (newCompleted) {
          // Completing parent: complete all subtasks recursively
          const completeSubtasks = async (parentId) => {
            const subtasks = await Task.find({ parentId, userId: req.userId });
            for (const sub of subtasks) {
              await Task.findByIdAndUpdate(sub._id, { completed: true });
              await completeSubtasks(sub._id);
            }
          };
          await completeSubtasks(task._id);
        } else {
          // Uncompleting parent: uncomplete all subtasks recursively
          const uncompleteSubtasks = async (parentId) => {
            const subtasks = await Task.find({ parentId, userId: req.userId });
            for (const sub of subtasks) {
              await Task.findByIdAndUpdate(sub._id, { completed: false });
              await uncompleteSubtasks(sub._id);
            }
          };
          await uncompleteSubtasks(task._id);
        }
      }
    }

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

// Delete all tasks in a list for the user, but prevent deleting "My Task List"
export const deleteTasksByList = async (req, res) => {
  try {
    const { listName } = req.params;
    if (listName === "My Task List") {
      return res.status(400).json({ error: "Cannot delete the default list" });
    }
    // Delete all tasks in the list for the user
    await Task.deleteMany({ userId: req.userId, listName });
    res.json({ message: `All tasks in list "${listName}" deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
