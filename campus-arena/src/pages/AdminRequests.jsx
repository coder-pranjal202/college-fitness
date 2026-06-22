import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { approveRequest, rejectRequest } from "../services/organizerService";

export default function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const user = auth.currentUser;

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (!userData || userData.role !== "admin") {
          if (!cancelled) setIsAdmin(false);
          if (!cancelled) setLoading(false);
          return;
        }

        if (!cancelled) setIsAdmin(true);

        // Load requests
        const snapshot = await getDocs(collection(db, "organizerRequests"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (!cancelled) setRequests(data.reverse());
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => { cancelled = true; };
  }, []);

  const refreshRequests = async () => {
    const snapshot = await getDocs(collection(db, "organizerRequests"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRequests(data.reverse());
  };

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      await approveRequest(request.id, request.userId, request.name || "User");
      alert(`${request.name || "User"} has been approved as an organizer!`);
      await refreshRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    try {
      await rejectRequest(request.id, request.userId, request.name || "User");
      alert(`Request from ${request.name || "User"} has been rejected.`);
      await refreshRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading requests...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Only admins can access this page.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">📋 Organizer Requests</h1>
            <p className="text-gray-400 mt-1">
              {requests.length} request{requests.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-gray-600 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Requests */}
        {requests.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-12 text-center border border-white/10">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl text-gray-300">No organizer requests yet.</p>
            <p className="text-gray-400 mt-2">
              When students submit requests, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const statusStyles = {
                pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                approved: "bg-green-500/20 text-green-400 border-green-500/30",
                rejected: "bg-red-500/20 text-red-400 border-red-500/30",
              };
              const statusLabels = {
                pending: "⏳ Pending",
                approved: "✅ Approved",
                rejected: "❌ Rejected",
              };

              return (
                <div
                  key={request.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-green-400">
                          {request.name || "Unknown"}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                            statusStyles[request.status] || "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {statusLabels[request.status] || request.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-gray-300">
                        <p>
                          <span className="text-gray-500">Email:</span> {request.email}
                        </p>
                        <p>
                          <span className="text-gray-500">Sport:</span> {request.sport}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-400 font-semibold mb-1">Reason:</p>
                        <p className="bg-white/5 rounded-xl p-4 text-gray-300">
                          {request.reason || "No reason provided."}
                        </p>
                      </div>

                      {request.experience && (
                        <div className="mt-3">
                          <p className="text-gray-400 font-semibold mb-1">Experience:</p>
                          <p className="bg-white/5 rounded-xl p-4 text-gray-300">
                            {request.experience}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === "pending" && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                      >
                        {processingId === request.id ? "Processing..." : "✅ Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                      >
                        {processingId === request.id ? "Processing..." : "❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}