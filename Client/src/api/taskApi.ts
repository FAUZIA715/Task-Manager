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
// Create Task API Call
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
// Update Task API Call
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
// Delete Task API Call
export const deleteTaskApi = async (id: string) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};
// Fetch Starred Tasks API Call
export const fetchStarredTasks = async () => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tasks/starred`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch starred tasks");
  return res.json();
};
//Change Password API Call
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to change password");
  }
  return res.json();
};
