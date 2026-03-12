// employee.service.js
export const createEmployee = async (payload) => {
  const token = localStorage.getItem("token"); // must be stored at login
  console.log(payload);
  
  const res = await fetch("http://localhost:5000/api/users/", {
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
