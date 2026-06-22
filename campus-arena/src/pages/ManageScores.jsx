import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getEventById } from "../services/eventService";
import { getEventRegistrations } from "../services/registrationService";
import {
  setEventResult,
  clearEventResult,
  addParticipantScore,
  updateParticipantScore,
  deleteParticipantScore,
  getEventScores,
} from "../services/scoreService";
import {
  Trophy,
  Medal,
  Award,
  Save,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  Edit3,
  Check,
} from "lucide-react";

export default function ManageScores() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Result form state
  const [winnerName, setWinnerName] = useState("");
  const [winnerScore, setWinnerScore] = useState("");
  const [runnerUpName, setRunnerUpName] = useState("");
  const [runnerUpScore, setRunnerUpScore] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  // New score form state
  const [showAddScore, setShowAddScore] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newScore, setNewScore] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit score state
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [editScoreValue, setEditScoreValue] = useState("");
  const [editNotesValue, setEditNotesValue] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid));
        const userData = userDoc.data();

        if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
          navigate("/dashboard");
          return;
        }

        const eventData = await getEventById(eventId);
        if (!eventData) {
          navigate("/organizer-dashboard");
          return;
        }

        if (eventData.createdBy !== auth.currentUser.uid && userData.role !== "admin") {
          alert("You can only manage scores for your own events.");
          navigate("/organizer-dashboard");
          return;
        }

        setIsAuthorized(true);
        setEvent(eventData);

        // Load result data
        if (eventData.hasResult) {
          setWinnerName(eventData.winnerName || "");
          setWinnerScore(eventData.winnerScore || "");
          setRunnerUpName(eventData.runnerUpName || "");
          setRunnerUpScore(eventData.runnerUpScore || "");
          setResultSummary(eventData.resultSummary || "");
        }

        // Load registrations for participant picker
        const regs = await getEventRegistrations(eventId);
        setRegistrants(regs);

        // Load existing scores
        const scoreData = await getEventScores(eventId);
        setScores(scoreData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (auth.currentUser) init();
    else navigate("/login");
  }, [eventId, navigate]);

  const handleSaveResult = async () => {
    if (!winnerName.trim()) {
      alert("Please enter at least the winner's name.");
      return;
    }

    setSaving(true);
    try {
      await setEventResult(eventId, {
        winnerName: winnerName.trim(),
        winnerScore: winnerScore.trim(),
        runnerUpName: runnerUpName.trim(),
        runnerUpScore: runnerUpScore.trim(),
        resultSummary: resultSummary.trim(),
      });
      setEvent((prev) => ({
        ...prev,
        hasResult: true,
        winnerName: winnerName.trim(),
        winnerScore: winnerScore.trim(),
        runnerUpName: runnerUpName.trim(),
        runnerUpScore: runnerUpScore.trim(),
        resultSummary: resultSummary.trim(),
      }));
      alert("Result saved successfully!");
    } catch {
      alert("Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearResult = async () => {
    if (!window.confirm("Are you sure you want to clear the result?")) return;

    setSaving(true);
    try {
      await clearEventResult(eventId);
      setWinnerName("");
      setWinnerScore("");
      setRunnerUpName("");
      setRunnerUpScore("");
      setResultSummary("");
      setEvent((prev) => ({ ...prev, hasResult: false }));
      alert("Result cleared.");
    } catch {
      alert("Failed to clear result.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddScore = async () => {
    if (!newUserName.trim() || !newScore) {
      alert("Please enter participant name and score.");
      return;
    }

    try {
      const scoreId = await addParticipantScore(
        eventId,
        newUserId || "manual-" + Date.now(),
        newUserName.trim(),
        parseFloat(newScore),
        newNotes.trim()
      );
      setScores((prev) => [
        ...prev,
        {
          id: scoreId,
          eventId,
          userId: newUserId || "manual-" + Date.now(),
          userName: newUserName.trim(),
          score: parseFloat(newScore),
          notes: newNotes.trim(),
        },
      ]);
      setNewUserId("");
      setNewUserName("");
      setNewScore("");
      setNewNotes("");
      setShowAddScore(false);
    } catch {
      alert("Failed to add score.");
    }
  };

  const handleUpdateScore = async (scoreId) => {
    if (!editScoreValue) return;

    try {
      await updateParticipantScore(scoreId, parseFloat(editScoreValue), editNotesValue.trim());
      setScores((prev) =>
        prev.map((s) =>
          s.id === scoreId
            ? { ...s, score: parseFloat(editScoreValue), notes: editNotesValue.trim() }
            : s
        )
      );
      setEditingScoreId(null);
      setEditScoreValue("");
      setEditNotesValue("");
    } catch {
      alert("Failed to update score.");
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm("Delete this score entry?")) return;

    try {
      await deleteParticipantScore(scoreId);
      setScores((prev) => prev.filter((s) => s.id !== scoreId));
    } catch {
      alert("Failed to delete score.");
    }
  };

  const startEditScore = (entry) => {
    setEditingScoreId(entry.id);
    setEditScoreValue(entry.score?.toString() || "");
    setEditNotesValue(entry.notes || "");
  };

  const selectRegistrant = (reg) => {
    setNewUserId(reg.userId);
    setNewUserName(reg.userName || "Anonymous");
  };

  const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized || !event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <button
          onClick={() => navigate("/organizer-dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-green-400 mb-2">📊 Manage Results & Scores</h1>
          <p className="text-gray-400 mb-8">
            Event: <span className="text-white">{event.title}</span> • {event.sport}
          </p>

          {/* ===== RESULT SECTION ===== */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <Trophy size={22} className="text-yellow-400" />
              <span>Event Result</span>
              {event?.hasResult && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                  Published
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-400">Winner *</label>
                <input
                  type="text"
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="Winner name"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Winner Score</label>
                <input
                  type="text"
                  value={winnerScore}
                  onChange={(e) => setWinnerScore(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g. 85, 3-2, 100m"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Runner-up</label>
                <input
                  type="text"
                  value={runnerUpName}
                  onChange={(e) => setRunnerUpName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="Runner-up name"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-400">Runner-up Score</label>
                <input
                  type="text"
                  value={runnerUpScore}
                  onChange={(e) => setRunnerUpScore(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g. 72, 1-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-gray-400">Match Summary</label>
                <textarea
                  rows={3}
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                  placeholder="Brief summary of the match result..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveResult}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Result"}
              </button>
              {event?.hasResult && (
                <button
                  onClick={handleClearResult}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Clear Result
                </button>
              )}
            </div>
          </div>

          {/* ===== SCORES / LEADERBOARD SECTION ===== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Medal size={22} />
                <span>Participant Scores</span>
                <span className="text-sm font-normal text-gray-400">({sortedScores.length})</span>
              </div>
              <button
                onClick={() => setShowAddScore(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1"
              >
                <Plus size={16} /> Add Score
              </button>
            </div>

            {/* Add Score Form */}
            {showAddScore && (
              <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-sm">New Score Entry</h4>
                  <button
                    onClick={() => setShowAddScore(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Pick from registrants */}
                {registrants.length > 0 && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 mb-1 block">Pick from registered participants:</label>
                    <div className="flex flex-wrap gap-2">
                      {registrants.map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => selectRegistrant(reg)}
                          className={`text-xs px-2 py-1 rounded-lg border transition ${
                            newUserId === reg.userId
                              ? "bg-green-500/20 border-green-500/50 text-green-400"
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                          }`}
                        >
                          {reg.userName || "Anonymous"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Participant Name *</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Score *</label>
                    <input
                      type="number"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="Optional notes (e.g. innings, time)"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddScore}
                  className="mt-3 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                >
                  <Plus size={16} /> Add to Leaderboard
                </button>
              </div>
            )}

            {/* Scores List */}
            {sortedScores.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Award size={40} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No scores added yet.</p>
                <p className="text-gray-500 text-sm mt-1">Add participant scores to build the leaderboard.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 px-4 py-2 bg-white/5 rounded-t-xl border border-white/10">
                  <span className="w-8">Rank</span>
                  <span className="flex-1">Participant</span>
                  <span className="w-20 text-right">Score</span>
                  <span className="w-24 text-right">Actions</span>
                </div>
                {sortedScores.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      index === 0
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : index === 1
                        ? "bg-gray-300/10 border-gray-300/20"
                        : index === 2
                        ? "bg-amber-600/10 border-amber-600/20"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="w-8">
                      {index === 0 && <Trophy size={18} className="text-yellow-400" />}
                      {index === 1 && <Medal size={18} className="text-gray-300" />}
                      {index === 2 && <Award size={18} className="text-amber-600" />}
                      {index > 2 && <span className="text-gray-500 text-sm font-bold">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-medium truncate block">
                        {entry.userName || "Anonymous"}
                      </span>
                      {entry.notes && (
                        <span className="text-gray-500 text-xs">{entry.notes}</span>
                      )}
                    </div>

                    <div className="w-20 text-right">
                      {editingScoreId === entry.id ? (
                        <input
                          type="number"
                          value={editScoreValue}
                          onChange={(e) => setEditScoreValue(e.target.value)}
                          className="w-20 bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-green-500/50"
                          step="0.1"
                          autoFocus
                        />
                      ) : (
                        <span className="text-green-400 font-bold text-sm">{entry.score}</span>
                      )}
                    </div>

                    <div className="w-24 text-right flex justify-end gap-1">
                      {editingScoreId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateScore(entry.id)}
                            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingScoreId(null)}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditScore(entry)}
                            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Edit Score"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteScore(entry.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
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