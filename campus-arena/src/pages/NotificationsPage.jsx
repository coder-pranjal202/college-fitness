import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { ArrowLeft, Bell, CheckCheck, Check, Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!auth.currentUser) { navigate("/login"); return; }
        const notifs = await getUserNotifications(auth.currentUser.uid);
        setNotifications(notifs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(auth.currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const typeIcons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    warning: <AlertCircle size={20} className="text-yellow-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const typeColors = {
    success: "border-l-green-500",
    warning: "border-l-yellow-500",
    error: "border-l-red-500",
    info: "border-l-blue-500",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell size={28} /> Notifications
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
            >
              <CheckCheck size={18} /> Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-12 text-center border border-white/10">
            <p className="text-6xl mb-4">🔔</p>
            <p className="text-xl text-gray-300">No notifications yet.</p>
            <p className="text-gray-400 mt-2">
              You'll be notified when your organizer request is reviewed or when events are updated.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-4 transition hover:bg-white/15 ${
                  typeColors[notif.type] || "border-l-blue-500"
                } ${!notif.read ? "border-l-4" : "border-l-2 opacity-70"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {typeIcons[notif.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <h3 className={`font-semibold ${!notif.read ? "text-white" : "text-gray-400"}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="text-gray-400 hover:text-green-400 transition"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {notif.createdAt?.toDate && (
                          <span className="text-xs text-gray-500">
                            {notif.createdAt.toDate().toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                    {notif.link && (
                      <button
                        onClick={() => navigate(notif.link)}
                        className="text-green-400 hover:text-green-300 text-sm font-semibold mt-2 transition"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}