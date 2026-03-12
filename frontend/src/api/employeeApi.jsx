export const checkEmployeeExists = async (data) => {
  const token = localStorage.getItem("token"); // Get your JWT
  
  // 1. Ensure the URL is correct (check your backend port)
  const res = await fetch(`${API_URL}/api/users/check-existence?email=${data.email}&employeeId=${data.employeeId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  // 2. IMPORTANT: Check if the response is actually JSON before parsing
  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Server returned non-JSON:", text);
    throw new Error("Server Error: Check if API route exists and you are logged in.");
  }

  return await res.json();
};