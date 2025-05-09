import { getCsrfToken } from "@/utils/security/csrf";
const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
};

export const getTasks = async (projectId, accountId) => {
  const response = await fetch(
    `${backendUrl}/task/${accountId}/${projectId}/tasks`
  );
  const json = await handleResponse(response);
  return json.data;
};

export const createTask = async (projectId, accountId, taskData) => {
  const csrfToken = getCsrfToken();
  const response = await fetch(
    `${backendUrl}/task/${accountId}/${projectId}/tasks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken
       },
      body: JSON.stringify([taskData]),
    }
  );
  const json = await handleResponse(response);
  return json.data[0];
};

export const updateTask = async (projectId, accountId, taskId, taskData) => {
  const csrfToken = getCsrfToken();
  const response = await fetch(
    `${backendUrl}/task/${accountId}/${projectId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify(taskData),
    }
  );
  const json = await handleResponse(response);
  return json.data;
};

export const deleteTask = async (projectId, accountId, taskId) => {
  const csrfToken = getCsrfToken();
  const response = await fetch(
    `${backendUrl}/task/${accountId}/${projectId}/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: {
        "X-CSRF-TOKEN": csrfToken
      },
    }
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  if (response.status === 204) {
    return { message: "Tarea eliminada correctamente." };
  }

  return response.json();
};
