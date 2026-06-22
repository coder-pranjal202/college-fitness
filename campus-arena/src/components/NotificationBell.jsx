import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUnreadCount } from "../services/notificationService";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!auth.currentUser) return;
      try {
        const count = await getUnreadCount(auth.currentUser.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCount();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative bg-white/[0.06] hover:bg-white/[0.12] p-2 rounded-full transition-all duration-200 ring-1 ring-white/[0.06] hover:ring-[#39ff78]/20"
      title="Notifications"
    >
      <Bell size={18} className="text-white/70" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg shadow-rose-500/30">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}