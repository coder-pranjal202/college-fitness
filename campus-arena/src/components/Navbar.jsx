import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User, Trophy, Bell, LogOut, Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const [photoURL, setPhotoURL] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const data = userDoc.data();
          if (!cancelled) {
            if (data?.photoURL) {
              setPhotoURL(data.photoURL);
            }
            if (data?.name) {
              setUserName(data.name);
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };
    fetchUserData();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <nav className="theme-navbar text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-lg sticky top-0 z-50">
      {/* Logo */}
      <div
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg sm:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Campus</span>
          <span className="text-white/90">Arena</span>
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-all duration-200 ring-1 ring-white/10 hover:ring-emerald-500/30"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
            )}
            <User size={14} className="hidden text-white/60" />
            <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
              {userName || auth.currentUser?.email?.split('@')[0]}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 theme-card rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up">
                <div className="px-4 py-3 border-b theme-separator">
                  <p className="text-sm font-semibold theme-text-primary">
                    {userName || "User"}
                  </p>
                  <p className="text-xs theme-text-muted truncate">
                    {auth.currentUser?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/organizer-dashboard");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary hover:bg-emerald-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Settings size={16} />
                    Organizer Dashboard
                  </button>
                </div>
                <div className="border-t theme-separator py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}