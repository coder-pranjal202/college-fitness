import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { createEvent } from "../services/eventService";
import ImageUpload from "../components/ImageUpload";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    async function checkAccess() {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      setUser(userData);
      setChecking(false);

      if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
        navigate("/dashboard");
      }
    }
    checkAccess();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title.trim() || !sport.trim() || !date || !location.trim()) {
      alert("Please fill in all required fields (Title, Sport, Date, Location).");
      return;
    }

    setLoading(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        sport: sport.trim(),
        date,
        time,
        location: location.trim(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : 0,
        posterUrl: posterUrl || "",
        createdBy: auth.currentUser.uid,
        createdByName: user?.name || auth.currentUser.displayName || "",
      });

      alert("Event created successfully!");
      navigate("/manage-events");
    } catch (error) {
      console.error(error);
      alert("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg">Checking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">🏟️ Create Sports Event</h1>
          <p className="text-gray-400 mb-8">Fill in the details to create a new sports event.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-200">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="Cricket Tournament 2026"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block mb-2 font-medium text-gray-200">
                Sport <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="Cricket, Football..."
              />
            </div>

            {/* Max Participants */}
            <div>
              <label className="block mb-2 font-medium text-gray-200">
                Max Participants
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="30 (leave blank for unlimited)"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-200">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block mb-2 font-medium text-gray-200">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-200">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="Main Ground, Room 101..."
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-200">
                Description
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
                placeholder="Describe the event, rules, prizes..."
              />
            </div>

            {/* Event Poster */}
            <div className="md:col-span-2">
              <ImageUpload
                currentImageUrl={posterUrl}
                onUploadComplete={(url) => setPosterUrl(url)}
                label="Event Poster (Optional)"
                maxSizeMB={5}
                aspect={16 / 9}
                cropTitle="Crop Event Poster"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white text-lg transition ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              onClick={() => navigate("/manage-events")}
              className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-gray-600 hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}