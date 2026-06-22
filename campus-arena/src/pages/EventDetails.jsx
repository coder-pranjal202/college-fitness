import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../services/firebase";
import { getEventById } from "../services/eventService";
import {
  registerForEvent,
  cancelRegistration,
  isUserRegistered,
  getRegistrationCount,
  getEventRegistrations,
} from "../services/registrationService";
import { getUserData } from "../services/getUser";
import { Calendar, MapPin, Users, Clock, User, CheckCircle, XCircle } from "lucide-react";
import TeamManagement from "../components/TeamManagement";
import CommentsSection from "../components/CommentsSection";
import ScoreBoard from "../components/ScoreBoard";
import SportTag from "../components/SportTag";
import ShareButton from "../components/ShareButton";

export default function EventDetails() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [registrants, setRegistrants] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventById(eventId);
        if (!eventData) {
          setLoading(false);
          return;
        }
        setEvent(eventData);

        if (auth.currentUser) {
          const userData = await getUserData(auth.currentUser.uid);
          setUser(userData);

          const isReg = await isUserRegistered(auth.currentUser.uid, eventId);
          setRegistered(isReg);
        }

        const count = await getRegistrationCount(eventId);
        setRegistrationCount(count);

        const regs = await getEventRegistrations(eventId);
        setRegistrants(regs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId]);

  const handleRegister = async () => {
    if (!auth.currentUser) {
      alert("Please login to register for events.");
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      await registerForEvent(
        auth.currentUser.uid,
        user?.name || auth.currentUser.displayName || "",
        eventId
      );
      setRegistered(true);
      setRegistrationCount((prev) => prev + 1);
      alert("Successfully registered for this event!");

      // Refresh registrants
      const regs = await getEventRegistrations(eventId);
      setRegistrants(regs);
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;

    setActionLoading(true);
    try {
      await cancelRegistration(auth.currentUser.uid, eventId);
      setRegistered(false);
      setRegistrationCount((prev) => prev - 1);
      alert("Registration cancelled.");

      const regs = await getEventRegistrations(eventId);
      setRegistrants(regs);
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-page flex items-center justify-center">
        <p className="theme-text-primary text-lg">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen theme-page flex items-center justify-center px-4">
        <div className="max-w-md w-full theme-card border-red-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-white mb-4">Event Not Found</h2>
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

  const isFull = event.maxParticipants && registrationCount >= event.maxParticipants;
  const isOrganizer = auth.currentUser && event.createdBy === auth.currentUser.uid;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen theme-page">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 theme-text-muted hover:theme-text-primary mb-6 transition"
        >
          ← Back to Dashboard
        </button>

        <div className="theme-card rounded-3xl p-8">
          {/* Event Poster */}
          {event.posterUrl && (
            <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Organizer */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-green-400 mb-2">{event.title}</h1>
              <p className="text-gray-400">
                Organized by <span className="text-white">{event.createdByName || "Unknown"}</span>
              </p>
            </div>

            {/* Registration Button */}
            <div className="flex gap-3">
              {auth.currentUser ? (
                registered ? (
                  <button
                    onClick={handleUnregister}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                  >
                    {actionLoading ? "..." : <><XCircle size={20} /> Unregister</>}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={actionLoading || isFull}
                    className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                      isFull
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {actionLoading
                      ? "Processing..."
                      : isFull
                      ? "Event Full"
                      : <><CheckCircle size={20} /> Register Now</>}
                  </button>
                )
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Login to Register
                </button>
              )}

              {(isOrganizer || isAdmin) && (
                <button
                  onClick={() => navigate(`/edit-event/${eventId}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Edit Event
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <SportTag sport={event.sport} size="lg" />
            <ShareButton title={event.title} url={window.location.href} />
          </div>

          {/* Event Info Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Calendar size={20} />
                <span className="font-semibold">Date</span>
              </div>
              <p className="text-gray-300">{event.date || "TBD"}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Clock size={20} />
                <span className="font-semibold">Time</span>
              </div>
              <p className="text-gray-300">{event.time || "TBD"}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <MapPin size={20} />
                <span className="font-semibold">Location</span>
              </div>
              <p className="text-gray-300">{event.location}</p>
            </div>
          </div>

          {/* Team Management (for team sports) */}
          <TeamManagement event={event} />

          {/* Description */}
          {event.description && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-3">📝 Description</h3>
              <p className="text-gray-300 bg-white/5 rounded-xl p-4 border border-white/10 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Participants */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <Users size={24} />
              <span>Participants ({registrationCount}{event.maxParticipants ? `/${event.maxParticipants}` : ""})</span>
            </div>

            {registrants.length === 0 ? (
              <p className="text-gray-400 bg-white/5 rounded-xl p-4 border border-white/10">
                No registrations yet. Be the first to register!
              </p>
            ) : (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="grid md:grid-cols-2 gap-3">
                  {registrants.map((reg) => (
                    <div key={reg.id} className="flex items-center gap-3 text-gray-300">
                      <User size={18} className="text-green-400" />
                      <span>{reg.userName || "Anonymous"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results & Scores with Live Updates */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mt-6">
            <ScoreBoard event={event} liveUpdate={true} />
          </div>

          {/* Comments / Discussion Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mt-6">
            <CommentsSection eventId={eventId} eventCreatorId={event.createdBy} />
          </div>
        </div>
      </div>
    </div>
  );
}