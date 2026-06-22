import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateUserProfile } from "../services/userService";
import { getMyRegistrations } from "../services/registrationService";
import { User, Mail, Building, Shield, Calendar, Edit3, Save, X, ArrowLeft, Award } from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import { ACHIEVEMENTS } from "../utils/constants";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [module, setModule] = useState("");
  const [semester, setSemester] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) { navigate("/login"); return; }

        // Get user data
        const userDoc = await getDoc(doc(db, "users", uid));
        const data = userDoc.data();
        setUserData(data);
        setName(data?.name || "");
        setDepartment(data?.department || "");
        setPhotoURL(data?.photoURL || null);
        setModule(data?.module || "");
        setSemester(data?.semester || "");

        // Get registrations
        const regs = await getMyRegistrations(uid);
        setRegistrations(regs);

        // Get events for registration names
        const eventSnap = await getDocs(collection(db, "events"));
        const eventMap = {};
        eventSnap.docs.forEach((d) => {
          eventMap[d.id] = d.data().title;
        });
        setEvents(eventMap);

        // Check organizer request status
        const q = query(
          collection(db, "organizerRequests"),
          where("userId", "==", uid)
        );
        const reqSnap = await getDocs(q);
        let reqStatus = null;
        if (!reqSnap.empty) {
          reqStatus = reqSnap.docs[0].data().status;
          setRequestStatus(reqStatus);
        }

        // Calculate achievements
        // Check created events
        const myEventsSnap = await getDocs(
          query(collection(db, "events"), where("createdBy", "==", uid))
        );
        const myEventsCount = myEventsSnap.size;

        // Check teams created (captain)
        const teamsCreatedSnap = await getDocs(
          query(collection(db, "teams"), where("captainId", "==", uid))
        );
        const teamsCreatedCount = teamsCreatedSnap.size;

        // Check teams joined
        const teamsJoinedSnap = await getDocs(collection(db, "teams"));
        let teamsJoinedCount = 0;
        teamsJoinedSnap.docs.forEach((d) => {
          const team = d.data();
          if (team.members?.some((m) => m.userId === uid)) teamsJoinedCount++;
        });

        // Check comments made
        const commentsSnap = await getDocs(
          query(collection(db, "comments"), where("userId", "==", uid))
        );

        const stats = {
          registrations: regs.length,
          teamsJoined: teamsJoinedCount,
          teamsCreated: teamsCreatedCount,
          isOrganizer: data?.role === "organizer" || data?.role === "admin" || false,
          eventsCreated: myEventsCount,
          comments: commentsSnap.size,
          scoresViewed: 0,
        };

        const earned = ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
        setAchievements(earned);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!name.trim()) { alert("Name is required."); return; }
    setSaving(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        name: name.trim(),
        department: department.trim(),
        module,
        semester,
        photoURL: photoURL || "",
      });
      setUserData((prev) => ({ ...prev, name: name.trim(), department: department.trim(), module, semester, photoURL: photoURL || "" }));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const roleBadge = {
    admin: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Admin" },
    organizer: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Organizer" },
    student: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Student" },
  };

  const badge = roleBadge[userData?.role] || roleBadge.student;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Profile Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div className="flex flex-wrap items-start gap-6">
              <div className="relative">
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-400/50"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400/50 ${userData?.photoURL ? "hidden" : ""}`}>
                  <User size={40} className="text-green-400" />
                </div>
                {editing && (
                  <div className="mt-2">
                    <ImageUpload
                      currentImageUrl={photoURL}
                      onUploadComplete={(url) => setPhotoURL(url)}
                      label=""
                      maxSizeMB={3}
                      aspect={1}
                      cropShape="round"
                      cropTitle="Crop Profile Photo"
                    />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userData?.name || "User"}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-0.5 rounded-full text-sm font-semibold border ${badge.color}`}>
                    {badge.label}
                  </span>
                  {requestStatus === "pending" && (
                    <span className="px-3 py-0.5 rounded-full text-sm font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Request Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <Save size={18} /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(userData?.name || ""); setDepartment(userData?.department || ""); }}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Mail size={18} />
                <span className="font-semibold">Email</span>
              </div>
              <p className="text-gray-300">{auth.currentUser?.email}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Shield size={18} />
                <span className="font-semibold">Role</span>
              </div>
              <p className="text-gray-300 capitalize">{userData?.role || "Student"}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Building size={18} />
                <span className="font-semibold">Department</span>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400"
                  placeholder="Computer Science"
                />
              ) : (
                <p className="text-gray-300">{userData?.department || "Not set"}</p>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Edit3 size={18} />
                <span className="font-semibold">Name</span>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400"
                />
              ) : (
                <p className="text-gray-300">{userData?.name || "Not set"}</p>
              )}
            </div>

            {/* Module & Semester */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Calendar size={18} />
                <span className="font-semibold">Module / Semester</span>
              </div>
              {editing ? (
                <div className="flex gap-2">
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="" className="bg-slate-900">Module</option>
                    {["Diploma", "B.Tech", "M.Tech", "PhD"].map((m) => (
                      <option key={m} value={m} className="bg-slate-900">{m}</option>
                    ))}
                  </select>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="" className="bg-slate-900">Sem</option>
                    {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-300">
                  {userData?.module ? `${userData.module} • ${userData.semester || "N/A"} Semester` : "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award size={24} className="text-yellow-400" /> Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((achievement) => {
                const earned = achievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-3 text-center border transition ${
                      earned
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-white/5 border-white/10 opacity-50"
                    }`}
                    title={achievement.desc}
                  >
                    <div className="text-3xl mb-1">{achievement.icon}</div>
                    <p className={`text-xs font-semibold ${earned ? "text-yellow-400" : "text-gray-500"}`}>
                      {achievement.name}
                    </p>
                    {earned && <p className="text-[10px] text-green-400 mt-0.5">✅ Earned</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registration History */}
          <div className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={24} /> Registration History
            </h2>

            {registrations.length === 0 ? (
              <p className="text-gray-400 bg-white/5 rounded-xl p-4 border border-white/10">
                You haven't registered for any events yet.
              </p>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-wrap justify-between items-center gap-3"
                  >
                    <div>
                      <p className="font-semibold text-green-400">
                        {events[reg.eventId] || "Unknown Event"}
                      </p>
                      <p className="text-sm text-gray-400">
                        Registered {reg.registeredAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/event/${reg.eventId}`)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                      View Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}