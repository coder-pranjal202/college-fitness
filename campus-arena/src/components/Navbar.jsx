import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPhoto = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const data = userDoc.data();
          if (!cancelled && data?.photoURL) {
            setPhotoURL(data.photoURL);
          }
        } catch (err) {
          console.error("Error fetching profile photo:", err);
        }
      }
    };
    fetchPhoto();
    return () => { cancelled = true; };
  }, []);

  return (
    <nav className="theme-navbar text-white px-6 py-3 flex justify-between items-center shadow-lg">
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-bold cursor-pointer tracking-tight flex items-center gap-2 transition hover:opacity-80"
      >
        <span className="text-[#39ff78]">Campus</span>
        <span className="text-white/90">Arena</span>
      </h1>

      <div className="flex items-center gap-2">
        <span className="text-sm text-white/40 hidden sm:block mr-1">
          {auth.currentUser?.email}
        </span>
        <ThemeToggle />
        <NotificationBell />
        <button
          onClick={() => navigate("/profile")}
          className="relative bg-white/[0.06] hover:bg-white/[0.12] p-1.5 rounded-full transition-all duration-200 overflow-hidden ring-1 ring-white/[0.06] hover:ring-[#39ff78]/30"
          title="Profile"
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
          ) : null}
          <User size={18} className={photoURL ? "hidden" : "text-white/60"} />
        </button>
      </div>
    </nav>
  );
}