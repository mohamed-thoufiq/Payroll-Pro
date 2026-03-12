import { API_URL } from "../config/api";

export const api = async (url, options = {}) => {
  const res = await fetch(`${API_URL}/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...options.headers
    }
  });
  return res.json();
};
