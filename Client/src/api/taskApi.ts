export const API_URL = import.meta.env.VITE_BASE_URL;

export const getToken = () => localStorage.getItem("token");

export const fetchTasks = async (listName: string = "My Task List") => {
  const token = getToken();
  const res = await fetch(
    `${API_URL}/tasks?listName=${encodeURIComponent(listName)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const createTask = async (taskData: {
  title: string;
  description: string;
  listName?: string;
  parentId?: string;
}) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    completed: boolean;
    order: number;
    starred: boolean;
    dueDate: number | undefined;
  }>
) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTaskApi = async (id: string) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

export const fetchStarredTasks = async () => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks/starred`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch starred tasks");
  return res.json();
};
