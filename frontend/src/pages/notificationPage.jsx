import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { FiBell, FiCheckCircle, FiClock, FiTrash2 } from "react-icons/fi";
import api from "../utils/api";
import { API_URL } from "../config/api.js";

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
    const socket = io(API_URL, { auth: { token } });
    
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <FiBell className="text-primary text-xl" /> Notifications & Alerts
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">Stay updated with payroll cycles, statutory tasks, and approval requests</p>
        </div>
        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          {notifications.filter(n => !n.isRead).length} New
        </span>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-4 rounded-xl border border-gray-200 transition-all cursor-pointer flex gap-4 shadow-sm hover:shadow-md
                ${n.isRead ? 'bg-gray-50/70 opacity-75' : 'bg-white border-l-4 border-l-primary'}`}
            >
              <div className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center self-start ${n.isRead ? 'bg-muted text-text-muted' : 'bg-blue-50 text-primary border border-blue-100'}`}>
                <FiBell size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-text-primary text-sm">{n.title}</h4>
                  <span className="text-xs text-text-muted flex items-center gap-1 shrink-0">
                    <FiClock size={12} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <FiBell className="mx-auto text-text-muted mb-2" size={32} />
            <p className="text-sm font-medium text-text-muted">No notifications received yet</p>
          </div>
        )}
      </div>
    </div>
  );
}