import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SportTag from "./SportTag";
import ShareButton from "./ShareButton";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="theme-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      {/* Poster Image */}
      {event.posterUrl ? (
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { 
              e.target.style.display = "none";
              e.target.nextSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-5xl">🏆</span>
        </div>
      )}

      <div className="p-5">
        {/* Title & Share */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-xl font-bold theme-text-primary line-clamp-2 flex-1 group-hover:text-emerald-500 transition-colors">
            {event.title}
          </h3>
          <ShareButton 
            title={event.title} 
            url={`${window.location.origin}/event/${event.id}`} 
          />
        </div>

        {/* Sport Tag */}
        <div className="mb-4">
          <SportTag sport={event.sport} />
        </div>

        {/* Description */}
        <p className="theme-text-secondary line-clamp-2 mb-4 text-sm leading-relaxed">
          {event.description || "No description available."}
        </p>

        {/* Event Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2.5 theme-text-muted text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-emerald-500" />
            </div>
            <span>{formatDate(event.date)}</span>
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {event.time}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 theme-text-muted text-sm">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-blue-500" />
            </div>
            <span className="truncate">{event.location || "Location TBD"}</span>
          </div>

          <div className="flex items-center gap-2.5 theme-text-muted text-sm">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-purple-500" />
            </div>
            <span>{event.maxParticipants ? `${event.maxParticipants} participants max` : "Unlimited participants"}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(`/event/${event.id}`)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40"
        >
          View Details
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}