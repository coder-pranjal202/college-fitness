import { useState, useEffect } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export default function ScoreBoard({ event, liveUpdate = false }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event?.id) return;

    if (liveUpdate) {
      // Real-time listener for live score updates
      const q = query(
        collection(db, "scores"),
        where("eventId", "==", event.id)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const scoreData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0)); // highest score first
        setScores(scoreData);
        setLoading(false);
      }, (err) => {
        console.error("Error loading scores:", err);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // One-time fetch
      async function fetchScores() {
        try {
          const { getEventScores } = await import("../services/scoreService");
          const data = await getEventScores(event.id);
          setScores(data);
        } catch (err) {
          console.error("Error loading scores:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchScores();
    }
  }, [event?.id, liveUpdate]);

  const hasResult = event?.hasResult;
  const winnerName = event?.winnerName;
  const winnerScore = event?.winnerScore;
  const runnerUpName = event?.runnerUpName;
  const runnerUpScore = event?.runnerUpScore;
  const resultSummary = event?.resultSummary;

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} className="text-yellow-400" />;
    if (index === 1) return <Medal size={18} className="text-gray-300" />;
    if (index === 2) return <Award size={18} className="text-amber-600" />;
    return <span className="text-gray-500 text-sm font-bold w-[18px] text-center">{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return "bg-yellow-500/10 border-yellow-500/30";
    if (index === 1) return "bg-gray-300/10 border-gray-300/20";
    if (index === 2) return "bg-amber-600/10 border-amber-600/20";
    return "bg-white/5 border-white/10";
  };

  if (liveUpdate && !loading) {
    // Show live indicator when using real-time updates
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xl font-bold mb-6">
        <TrendingUp size={24} />
        <span>Results & Scores</span>
        {liveUpdate && !loading && (
          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Winner / Result Banner */}
      {hasResult && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6 text-center">
          <Trophy size={40} className="mx-auto text-yellow-400 mb-2" />
          <h3 className="text-2xl font-bold text-yellow-400 mb-1">🏆 {winnerName}</h3>
          {winnerScore && (
            <p className="text-lg text-gray-300">
              Score: <span className="text-white font-bold">{winnerScore}</span>
            </p>
          )}
          {runnerUpName && (
            <p className="text-sm text-gray-400 mt-1">
              Runner-up: {runnerUpName}{runnerUpScore ? ` (${runnerUpScore})` : ""}
            </p>
          )}
          {resultSummary && (
            <p className="text-gray-400 mt-3 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              {resultSummary}
            </p>
          )}
        </div>
      )}

      {/* Participant Scores Leaderboard */}
      {loading ? (
        <div className="text-center py-6 text-gray-400">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mb-2" />
          <p className="text-sm">Loading scores...</p>
        </div>
      ) : scores.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 px-4 pb-1">
            <span>Rank</span>
            <span>Participant</span>
            <span>Score</span>
          </div>
          {scores.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${getRankBg(index)}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getRankIcon(index)}
                <span className="text-white font-medium text-sm truncate">
                  {entry.userName || "Anonymous"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {entry.notes && (
                  <span className="text-xs text-gray-500 hidden sm:inline truncate max-w-[120px]">
                    {entry.notes}
                  </span>
                )}
                <span className="text-green-400 font-bold text-sm">{entry.score}</span>
              </div>
            </div>
          ))}
        </div>
      ) : !hasResult ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <TrendingUp size={40} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No results or scores available yet.</p>
          <p className="text-gray-500 text-sm mt-1">Check back after the event concludes.</p>
        </div>
      ) : null}
    </div>
  );
}