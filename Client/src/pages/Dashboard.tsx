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
}

/* ✅ Draggable Task Component */
const SortableItem = ({
  task,
  toggleTask,
  deleteTask,
}: {
  task: Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          <h3
            className={`font-semibold ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            deleteTask(task.id);
          }}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  /* ✅ Fetch tasks */
  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      const mappedTasks = data.map((task: any) => ({
        id: task._id,
        title: task.title || "No Title",
        description: task.description || "",
        completed: task.completed || false,
        dueDate: task.dueDate || undefined,
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadTasks();
  }, [user?.id]);

  /* ✅ Input Handler */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ✅ Add Task */
  const addTask = async () => {
    if (!form.title.trim()) return;
    try {
      const newTask = await createTask(form);
      setTasks((prev) => [
        { id: newTask._id, ...form, completed: false },
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

  /* ✅ Delete Task */
  const deleteTask = async (id: string) => {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
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
        <h2 className="text-2xl font-bold">Welcome, {user?.name} 👋</h2>
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
                  deleteTask={deleteTask}
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
                      deleteTask={deleteTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
