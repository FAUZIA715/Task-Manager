import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTaskApi,
} from "../api/taskApi";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  listName?: string;
}

/* ✅ Draggable Task Component */
const SortableItem = ({
  task,
  toggleTask,
  updateTaskDetails,
  deleteTask,
  setDeadlineDialog,
  setSubtaskDialog,
  isCompleted,
}: {
  task: Task;
  toggleTask: (id: string) => void;
  updateTaskDetails: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setDeadlineDialog: React.Dispatch<
    React.SetStateAction<{ open: boolean; taskId: string }>
  >;
  setSubtaskDialog: React.Dispatch<
    React.SetStateAction<{ open: boolean; taskId: string }>
  >;
  isCompleted: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSave = () => {
    if (editTitle.trim() !== task.title) {
      updateTaskDetails(task.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (editDescription.trim() !== (task.description || "")) {
      updateTaskDetails(task.id, {
        description: editDescription.trim() || undefined,
      });
    }
    setIsEditingDescription(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, save: () => void) => {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setEditTitle(task.title);
      setEditDescription(task.description || "");
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-3 flex justify-between items-center transition-all duration-300 ease-in-out transform ${
        task.completed ? "bg-green-50 opacity-70" : "bg-white opacity-100"
      } shadow-sm`}
    >
      <div className="flex items-center gap-3 grow">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          className="w-5 h-5 cursor-pointer accent-green-600"
        />
        <div className="grow min-w-0">
          {isEditingTitle ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => handleKeyPress(e, handleTitleSave)}
              className="font-semibold text-gray-900 mb-1"
              autoFocus
            />
          ) : (
            <h3
              className={`font-semibold cursor-pointer ${
                task.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
              onClick={() => setIsEditingTitle(true)}
            >
              {task.title}
            </h3>
          )}
          {isEditingDescription ? (
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              onKeyDown={(e) => handleKeyPress(e, handleDescriptionSave)}
              className="text-sm text-gray-600"
              placeholder="Add description..."
              autoFocus
            />
          ) : (
            <p
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => setIsEditingDescription(true)}
            >
              {task.description || "Add description..."}
            </p>
          )}
          {task.dueDate && (
            <p
              className={`text-xs ${
                new Date(task.dueDate) < new Date()
                  ? "text-red-500 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Due: {new Date(task.dueDate).toLocaleDateString()}
              {new Date(task.dueDate) < new Date()
                ? ` (Overdue by ${Math.floor(
                    (new Date().getTime() - new Date(task.dueDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} days)`
                : ""}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              ⋯
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isCompleted && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    setDeadlineDialog({ open: true, taskId: task.id })
                  }
                >
                  Add deadline
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSubtaskDialog({ open: true, taskId: task.id })
                  }
                >
                  Add subtask
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                deleteTask(task.id);
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentList, setCurrentList] = useState("My Task List");
  const [lists, setLists] = useState<string[]>(["My Task List"]);

  useEffect(() => {
    if (user?.id) {
      const savedLists = localStorage.getItem(`taskLists_${user.id}`);
      setLists(savedLists ? JSON.parse(savedLists) : ["My Task List"]);
    }
  }, [user?.id]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deadlineDialog, setDeadlineDialog] = useState({
    open: false,
    taskId: "",
  });
  const [subtaskDialog, setSubtaskDialog] = useState({
    open: false,
    taskId: "",
  });
  const [listDialog, setListDialog] = useState({ open: false });
  const [newListName, setNewListName] = useState("");
  const [deadlineForm, setDeadlineForm] = useState({ dueDate: "" });
  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    description: "",
  });

  /* ✅ Fetch tasks */
  const loadTasks = async (listName: string = currentList) => {
    try {
      const data = await fetchTasks(listName);
      const mappedTasks = data.map((task: any) => ({
        id: task._id,
        title: task.title || "No Title",
        description: task.description || "",
        completed: task.completed || false,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : undefined,
        listName: task.listName || "My Task List",
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadTasks(currentList);
  }, [user?.id, currentList]);

  /* ✅ Input Handler */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ✅ Add Task */
  const addTask = async () => {
    if (!form.title.trim()) return;
    try {
      const newTask = await createTask({ ...form, listName: currentList });
      setTasks((prev) => [
        { id: newTask._id, ...form, completed: false, listName: currentList },
        ...prev,
      ]);
      setForm({ title: "", description: "", dueDate: "" });
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  /* ✅ Toggle Complete / Active — instantly move between lists */
  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      // Optimistic UI update
      setTasks((prevTasks) => {
        const updated = prevTasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );

        // Split tasks into active and completed
        const active = updated.filter((t) => !t.completed);
        const completed = updated.filter((t) => t.completed);

        // Show completed section if we just completed a task
        if (!task.completed) {
          setShowCompleted(true);
        } else if (completed.length === 0) {
          // Hide completed section if no tasks are completed
          setShowCompleted(false);
        }

        // Return active tasks first, then completed
        return active.concat(completed);
      });

      // Update backend
      await updateTask(id, { completed: !task.completed });
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Rollback on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === id ? { ...t, completed: task.completed } : t
        )
      );
    }
  };

  /* ✅ Update Task */
  const updateTaskDetails = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  /* ✅ Delete Task */
  const deleteTask = async (id: string) => {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  /* ✅ Add Deadline */
  const addDeadline = async () => {
    if (!deadlineForm.dueDate) return;
    try {
      const dueDateTimestamp = new Date(deadlineForm.dueDate).getTime();
      await updateTask(deadlineDialog.taskId, {
        dueDate: dueDateTimestamp,
      } as any);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === deadlineDialog.taskId
            ? { ...t, dueDate: deadlineForm.dueDate }
            : t
        )
      );
      setDeadlineDialog({ open: false, taskId: "" });
      setDeadlineForm({ dueDate: "" });
    } catch (error) {
      console.error("Failed to add deadline:", error);
    }
  };

  /* ✅ Add Subtask */
  const addSubtask = async () => {
    if (!subtaskForm.title.trim()) return;
    try {
      const newSubtask = await createTask(subtaskForm as any);
      // For now, just add as a regular task. In a full implementation, you'd handle subtasks differently.
      setTasks((prev) => [
        { id: newSubtask._id, ...subtaskForm, completed: false },
        ...prev,
      ]);
      setSubtaskDialog({ open: false, taskId: "" });
      setSubtaskForm({ title: "", description: "" });
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  /* ✅ Create List */
  const createList = () => {
    if (!newListName.trim() || lists.includes(newListName.trim())) return;
    const newLists = [...lists, newListName.trim()];
    setLists(newLists);
    localStorage.setItem(`taskLists_${user?.id}`, JSON.stringify(newLists));
    setCurrentList(newListName.trim());
    setNewListName("");
    setListDialog({ open: false });
  };

  /* ✅ Handle Drag End */
  const handleDragEnd = (event: any, isCompleted: boolean) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks((prevTasks) => {
      const filtered = prevTasks.filter((t) => t.completed === isCompleted);
      const activeIndex = filtered.findIndex((t) => t.id === active.id);
      const overIndex = filtered.findIndex((t) => t.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return prevTasks;

      const reordered = arrayMove(filtered, activeIndex, overIndex);
      const others = prevTasks.filter((t) => t.completed !== isCompleted);
      return [...others, ...reordered];
    });
  };

  /* ✅ Split tasks */
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) return <div className="p-6 text-center">Loading tasks...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user?.name} 👋</h2>
          <div className="flex items-center gap-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {currentList} ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {lists.map((list) => (
                  <DropdownMenuItem
                    key={list}
                    onClick={() => setCurrentList(list)}
                  >
                    {list}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setListDialog({ open: true })}
            >
              + New List
            </Button>
          </div>
        </div>
        <Button onClick={logout} variant="secondary">
          Logout
        </Button>
      </div>

      {/* Add Task */}
      <Card className="p-4 mb-6 shadow-lg">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-xl">Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 p-0 flex-wrap">
          <Input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="grow"
          />
          <Input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="grow"
          />
          <Input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className="grow"
          />
          <Button onClick={addTask}>Add</Button>
        </CardContent>
      </Card>

      {/* === ACTIVE TASKS === */}
      <h3 className="text-xl font-semibold mb-3">
        Active Tasks ({activeTasks.length})
      </h3>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(e) => handleDragEnd(e, false)}
      >
        <SortableContext
          items={activeTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => (
                <SortableItem
                  key={task.id}
                  task={task}
                  toggleTask={toggleTask}
                  updateTaskDetails={updateTaskDetails}
                  deleteTask={deleteTask}
                  setDeadlineDialog={setDeadlineDialog}
                  setSubtaskDialog={setSubtaskDialog}
                  isCompleted={false}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-5 border rounded-lg bg-gray-50">
                No active tasks 🎉
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* === COMPLETED TASKS === */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex justify-between items-center w-full bg-gray-100 hover:bg-gray-200 transition px-4 py-3 rounded-lg text-left border"
          >
            <span className="font-medium text-lg text-gray-700">
              {showCompleted ? "Hide Completed Tasks" : "Show Completed Tasks"}{" "}
              <span className="font-normal text-sm text-gray-500">
                ({completedTasks.length})
              </span>
            </span>
            <span className="text-gray-500 text-xl">
              {showCompleted ? "▲" : "▼"}
            </span>
          </button>

          {showCompleted && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, true)}
            >
              <SortableContext
                items={completedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 mt-4">
                  {completedTasks.map((task) => (
                    <SortableItem
                      key={task.id}
                      task={task}
                      toggleTask={toggleTask}
                      updateTaskDetails={updateTaskDetails}
                      deleteTask={deleteTask}
                      setDeadlineDialog={setDeadlineDialog}
                      setSubtaskDialog={setSubtaskDialog}
                      isCompleted={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Deadline Dialog */}
      <Dialog
        open={deadlineDialog.open}
        onOpenChange={(open) =>
          setDeadlineDialog({ open, taskId: deadlineDialog.taskId })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deadline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={deadlineForm.dueDate}
              onChange={(e) => setDeadlineForm({ dueDate: e.target.value })}
              placeholder="Select due date"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeadlineDialog({ open: false, taskId: "" })}
            >
              Cancel
            </Button>
            <Button onClick={addDeadline}>Add Deadline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask Dialog */}
      <Dialog
        open={subtaskDialog.open}
        onOpenChange={(open) =>
          setSubtaskDialog({ open, taskId: subtaskDialog.taskId })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Subtask title"
              value={subtaskForm.title}
              onChange={(e) =>
                setSubtaskForm({ ...subtaskForm, title: e.target.value })
              }
            />
            <Input
              placeholder="Subtask description (optional)"
              value={subtaskForm.description}
              onChange={(e) =>
                setSubtaskForm({ ...subtaskForm, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubtaskDialog({ open: false, taskId: "" })}
            >
              Cancel
            </Button>
            <Button onClick={addSubtask}>Add Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Dialog */}
      <Dialog
        open={listDialog.open}
        onOpenChange={(open) => setListDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setListDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button onClick={createList}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
