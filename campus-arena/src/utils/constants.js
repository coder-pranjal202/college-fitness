// Sport color tags for Event Category Tags feature
export const SPORT_COLORS = {
  cricket: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  football: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  soccer: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  basketball: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  volleyball: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  badminton: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  tennis: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  athletics: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  "table tennis": { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  chess: { bg: "bg-stone-500/20", text: "text-stone-400", border: "border-stone-500/30" },
  hockey: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
  kabaddi: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
};

export const getSportColor = (sport) => {
  if (!sport) return { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };
  const key = sport.toLowerCase().trim();
  return SPORT_COLORS[key] || { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" };
};

// Achievement badges
export const ACHIEVEMENTS = [
  { id: "first_registration", name: "First Step", icon: "👣", desc: "Register for your first event", check: (stats) => stats.registrations >= 1 },
  { id: "five_events", name: "Event Enthusiast", icon: "🎯", desc: "Register for 5 events", check: (stats) => stats.registrations >= 5 },
  { id: "team_player", name: "Team Player", icon: "🤝", desc: "Join a team", check: (stats) => stats.teamsJoined >= 1 },
  { id: "captain", name: "Captain", icon: "👑", desc: "Create a team", check: (stats) => stats.teamsCreated >= 1 },
  { id: "organizer", name: "Organizer", icon: "📋", desc: "Become an event organizer", check: (stats) => stats.isOrganizer },
  { id: "event_creator", name: "Event Creator", icon: "🏟️", desc: "Create your first event", check: (stats) => stats.eventsCreated >= 1 },
  { id: "commenter", name: "Voice", icon: "💬", desc: "Post a comment on an event", check: (stats) => stats.comments >= 1 },
  { id: "score_watcher", name: "Score Follower", icon: "📊", desc: "View scores on 3 events", check: (stats) => stats.scoresViewed >= 3 },
];