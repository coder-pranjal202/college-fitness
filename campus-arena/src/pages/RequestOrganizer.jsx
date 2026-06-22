import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function RequestOrganizer() {
  const navigate = useNavigate();
  const [sport, setSport] = useState("");
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setCheckingStatus(false);
          return;
        }

        // Check user's role
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        setUserRole(userData?.role);

        if (userData?.role === "organizer" || userData?.role === "admin") {
          setCheckingStatus(false);
          return;
        }

        // Check if they already have a request
        const q = query(
          collection(db, "organizerRequests"),
          where("userId", "==", uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const req = snapshot.docs[0].data();
          setAlreadySubmitted(true);
          setExistingStatus(req.status);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExistingRequest();
  }, []);

  const handleSubmit = async () => {
    if (!sport.trim()) {
      alert("Please enter a sport.");
      return;
    }
    if (!reason.trim()) {
      alert("Please explain why you want to become an organizer.");
      return;
    }

    setLoading(true);

    try {
      // Check if the user has already submitted a request
      const q = query(
        collection(db, "organizerRequests"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("You have already submitted a request.");
        setAlreadySubmitted(true);
        setExistingStatus(snapshot.docs[0].data().status);
        setLoading(false);
        return;
      }

      // Save the request to Firestore
      await addDoc(collection(db, "organizerRequests"), {
        userId: auth.currentUser.uid,
        name: auth.currentUser.displayName || "",
        email: auth.currentUser.email,
        sport: sport.trim(),
        reason: reason.trim(),
        experience: experience.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Request submitted successfully! The admin will review your request.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg">Checking...</p>
      </div>
    );
  }

  // Already an organizer or admin
  if (userRole === "organizer" || userRole === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-green-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {userRole === "admin" ? "You're an Admin" : "You're Already an Organizer"}
          </h2>
          <p className="text-gray-300 mb-6">
            {userRole === "admin"
              ? "You have full access to manage events and requests."
              : "You already have organizer access. You can create and manage events from your dashboard."}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Already submitted
  if (alreadySubmitted) {
    const statusConfig = {
      pending: { emoji: "⏳", text: "Pending", color: "text-yellow-400" },
      approved: { emoji: "🎉", text: "Approved", color: "text-green-400" },
      rejected: { emoji: "😔", text: "Rejected", color: "text-red-400" },
    };
    const config = statusConfig[existingStatus] || statusConfig.pending;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">{config.emoji}</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Request {config.text}
          </h2>
          <p className={`text-lg font-semibold mb-6 ${config.color}`}>
            Status: {config.text}
          </p>
          <p className="text-gray-300 mb-6">
            {existingStatus === "pending"
              ? "Your request is under review. The admin will notify you once it's processed."
              : existingStatus === "approved"
              ? "Congratulations! Your request has been approved. You can now manage events."
              : "Unfortunately, your request has been rejected. Please contact the admin for more details."}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            Request Event Organizer Access
          </h2>
          <p className="text-gray-400 mb-8">
            Fill out this form to request organizer access. The admin will review your application.
          </p>

          {/* Sport */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-200">
              Which Sport? <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              placeholder="e.g. Football, Basketball, Cricket"
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-200">
              Why do you want to become an organizer? <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
              placeholder="Tell us about your motivation..."
            />
          </div>

          {/* Experience */}
          <div className="mb-8">
            <label className="block mb-2 font-medium text-gray-200">
              Previous Experience <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows="3"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
              placeholder="Any relevant experience organizing events..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full px-6 py-3 rounded-xl font-semibold text-white text-lg transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full mt-3 px-6 py-3 rounded-xl font-semibold text-gray-300 border border-gray-600 hover:bg-white/10 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}