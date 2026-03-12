// employee.service.js
import { API_URL } from "../../../config/api";
export const createEmployee = async (payload) => {
  const token = localStorage.getItem("token"); // must be stored at login
  console.log(payload);
  
  const res = await fetch(`${API_URL}/api/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // <--- REQUIRED
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create employee");
  }

  return data;
};
