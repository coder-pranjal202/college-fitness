import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SportTag from "./SportTag";
import ShareButton from "./ShareButton";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl shadow-lg hover:scale-105 transition overflow-hidden">
      {/* Poster Image */}
      {event.posterUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-2xl font-bold text-green-400 truncate flex-1">
            {event.title}
          </h3>
          <ShareButton title={event.title} url={`${window.location.origin}/event/${event.id}`} />
        </div>

        <div className="mb-3">
          <SportTag sport={event.sport} />
        </div>

        <p className="text-gray-300 line-clamp-2 mb-4">
          {event.description || "No description available."}
        </p>

        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Calendar size={16} />
          <span>{event.date}{event.time ? ` at ${event.time}` : ""}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Users size={16} />
          <span>{event.maxParticipants || "Unlimited"} participants</span>
        </div>

        <button
          onClick={() => navigate(`/event/${event.id}`)}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          View Details <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}