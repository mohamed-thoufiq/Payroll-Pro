import Swal from 'sweetalert2';
import { API_URL } from "../config/api";
export const downloadReport = async (url, filename) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      // If server returns 404 (No data found)
      if (res.status === 404) {
        Swal.fire({
          icon: 'info',
          title: 'No Data Found',
          text: 'No payroll is locked for this month. Please finalize payroll before downloading.',
          confirmButtonColor: '#3085d6',
        });
        return; 
      }
      throw new Error("Server error");
    }

    const blob = await res.blob();
    
    // Trigger download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    console.error("🚨 DOWNLOAD ERROR:", err);
    Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Something went wrong while generating your report.',
    });
  }
};