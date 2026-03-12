import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { FiBell, FiCheckCircle, FiClock, FiTrash2 } from "react-icons/fi";
import api from "../utils/api";
import { API_URL } from "../config/api";

export default function NotificationCenter() {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const id = user._id || user.id; 
  useEffect(() => {
    if (!token || !id) return;

    // 1. Fetch Existing
    const fetchAll = async () => {
      const res = await api.get("/notification");
      setNotifications(res.data);
    };
    fetchAll();

    // 2. Setup Real-time Listener
    const socket = io(`${API_URL}`, { auth: { token } });
    
    socket.emit("join", id);
    
    socket.on("notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      // Optional: Play a subtle notification sound here
    });

    return () => socket.disconnect();
  }, [token, user]);

  const markAsRead = async (id) => {
    await api.patch(`/notification/${id}/read`);
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-6">
        <h2 className="text-3xl font-black text-slate-900 uppercase italic">Alerts</h2>
        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black">
          {notifications.filter(n => !n.isRead).length} NEW
        </span>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div 
            key={n._id}
            onClick={() => !n.isRead && markAsRead(n._id)}
            className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex gap-4
              ${n.isRead ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-50'}`}
          >
            <div className={`p-4 rounded-2xl ${n.isRead ? 'bg-slate-200' : 'bg-indigo-100 text-indigo-600'}`}>
              <FiBell size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-black text-slate-800">{n.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FiClock /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}