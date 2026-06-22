import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { 
  getEventTeams, 
  getUserTeamForEvent, 
  createTeam, 
  joinTeam, 
  leaveTeam, 
  deleteTeam,
  isTeamSport 
} from "../services/teamService";
import { getUserData } from "../services/getUser";
import { Users, UserPlus, LogOut, Trash2, Plus, Crown } from "lucide-react";

export default function TeamManagement({ event }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState(11);

  useEffect(() => {
    async function init() {
      if (!event?.id) return;
      const allTeams = await getEventTeams(event.id);
      setTeams(allTeams);
      if (auth.currentUser) {
        const userTeam = await getUserTeamForEvent(event.id, auth.currentUser.uid);
        setMyTeam(userTeam);
      }
      setLoading(false);
    }
    init();
  }, [event?.id]);

  const refreshTeams = async () => {
    if (!event?.id) return;
    const allTeams = await getEventTeams(event.id);
    setTeams(allTeams);
    if (auth.currentUser) {
      const userTeam = await getUserTeamForEvent(event.id, auth.currentUser.uid);
      setMyTeam(userTeam);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) { alert("Please enter a team name."); return; }
    if (!auth.currentUser) { alert("Please login first."); navigate("/login"); return; }

    setActionLoading(true);
    try {
      const userData = await getUserData(auth.currentUser.uid);
      await createTeam(event.id, {
        name: teamName.trim(),
        captainId: auth.currentUser.uid,
        captainName: userData?.name || auth.currentUser.displayName || "",
        maxMembers: maxMembers,
      });
      setShowCreateForm(false);
      setTeamName("");
      await refreshTeams();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (teamId) => {
    if (!auth.currentUser) { navigate("/login"); return; }

    setActionLoading(true);
    try {
      const userData = await getUserData(auth.currentUser.uid);
      await joinTeam(teamId, {
        userId: auth.currentUser.uid,
        userName: userData?.name || auth.currentUser.displayName || "",
      });
      await refreshTeams();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm("Leave this team?")) return;

    setActionLoading(true);
    try {
      await leaveTeam(teamId, auth.currentUser.uid);
      await refreshTeams();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Delete this team permanently?")) return;

    setActionLoading(true);
    try {
      await deleteTeam(teamId, auth.currentUser.uid);
      await refreshTeams();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isTeamSport(event)) return null;

  if (loading) {
    return (
      <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
        <p className="text-gray-400">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 text-xl font-bold mb-4">
        <Users size={24} />
        <span>Teams ({teams.length})</span>
      </div>

      {myTeam && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="font-semibold text-green-400 flex items-center gap-2">
                <Crown size={18} /> {myTeam.name}
              </p>
              <p className="text-sm text-gray-400">
                Captain: {myTeam.captainName} • {myTeam.members.length}/{myTeam.maxMembers} members
              </p>
            </div>
            <div className="flex gap-2">
              {myTeam.captainId === auth.currentUser?.uid && (
                <button
                  onClick={() => handleDeleteTeam(myTeam.id)}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              {myTeam.captainId !== auth.currentUser?.uid && (
                <button
                  onClick={() => handleLeaveTeam(myTeam.id)}
                  disabled={actionLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                >
                  <LogOut size={14} /> Leave
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!myTeam && auth.currentUser && (
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 mb-4"
        >
          <Plus size={18} /> {showCreateForm ? "Cancel" : "Create Team"}
        </button>
      )}

      {showCreateForm && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Members</label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 11)}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              min="2"
              max="50"
            />
          </div>
          <button
            onClick={handleCreateTeam}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded-lg font-semibold transition text-sm"
          >
            {actionLoading ? "Creating..." : "Create Team"}
          </button>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="text-gray-400 bg-white/5 rounded-xl p-4 border border-white/10">
          No teams created yet. Be the first to create one!
        </p>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => {
            const isCaptain = auth.currentUser && team.captainId === auth.currentUser.uid;
            const isMember = team.members.some((m) => m.userId === auth.currentUser?.uid);
            const isFull = team.members.length >= team.maxMembers;

            return (
              <div
                key={team.id}
                className={`bg-white/5 rounded-xl p-4 border ${
                  isCaptain ? "border-yellow-500/30" : "border-white/10"
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-green-400">{team.name}</h4>
                      {isCaptain && <Crown size={16} className="text-yellow-400" />}
                    </div>
                    <p className="text-sm text-gray-400">
                      Captain: {team.captainName} • {team.members.length}/{team.maxMembers} members
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {team.members.map((member, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            member.userId === team.captainId
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          <UserPlus size={10} />
                          {member.userName || "Anonymous"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {!isMember && auth.currentUser && !myTeam && !isFull && (
                    <button
                      onClick={() => handleJoinTeam(team.id)}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                    >
                      <UserPlus size={14} /> Join
                    </button>
                  )}
                  {isFull && !isMember && (
                    <span className="text-red-400 text-sm font-semibold">Full</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}