import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserData } from "../services/getUser";
import {
  addComment,
  deleteComment,
  editComment,
  toggleLikeComment,
  getEventComments,
} from "../services/commentService";
import {
  MessageCircle,
  Send,
  Trash2,
  Edit3,
  Check,
  X,
  ThumbsUp,
} from "lucide-react";

export default function CommentsSection({ eventId, eventCreatorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchComments() {
      try {
        const data = await getEventComments(eventId);
        if (mounted) setComments(data);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchComments();
    return () => { mounted = false; };
  }, [eventId]);

  // Fetch user data immediately if already logged in
  useEffect(() => {
    if (auth.currentUser && !userData) {
      getUserData(auth.currentUser.uid).then((data) => {
        setUserData(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      
      if (user) {
        getUserData(user.uid).then((data) => {
          if (!cancelled) setUserData(data);
        });
      } else {
        setUserData(null);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      await addComment(
        eventId,
        currentUser.uid,
        userData?.name || currentUser.displayName || "Anonymous",
        userData?.photoURL || currentUser.photoURL || "",
        newComment
      );
      setNewComment("");
      const data = await getEventComments(eventId);
      setComments(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(commentId);
      const data = await getEventComments(eventId);
      setComments(data);
    } catch {
      alert("Failed to delete comment.");
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await editComment(commentId, editText);
      setEditingId(null);
      setEditText("");
      const data = await getEventComments(eventId);
      setComments(data);
    } catch {
      alert("Failed to edit comment.");
    }
  };

  const handleLike = async (commentId) => {
    if (!currentUser) {
      alert("Please login to like comments.");
      return;
    }
    try {
      await toggleLikeComment(commentId, currentUser.uid);
      const data = await getEventComments(eventId);
      setComments(data);
    } catch {
      alert("Failed to like comment.");
    }
  };

  const canModify = (comment) => {
    if (!currentUser) return false;
    if (comment.userId === currentUser.uid) return true;
    if (userData?.role === "admin") return true;
    if (eventCreatorId === currentUser.uid) return true;
    return false;
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xl font-bold mb-6">
        <MessageCircle size={24} />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Add Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold shrink-0">
              {(userData?.name || currentUser.displayName || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this event..."
                rows={3}
                className="w-full theme-input rounded-xl p-3 resize-none transition"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
                >
                  {submitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send size={16} />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="theme-card-inner rounded-xl p-5 mb-6 text-center theme-text-muted">
          <MessageCircle size={20} className="inline mb-2" />
          <p>
            <Link to="/login" className="text-green-400 hover:underline">
              Login
            </Link>{" "}
            to join the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 theme-text-muted">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mb-2" />
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="theme-card-inner rounded-xl p-8 text-center">
          <MessageCircle size={40} className="mx-auto theme-text-muted mb-3" />
          <p className="theme-text-muted">No comments yet. Be the first to start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="theme-card-inner rounded-xl p-4 transition"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {comment.userPhotoURL ? (
                      <img
                        src={comment.userPhotoURL}
                        alt={comment.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (comment.userName || "A")[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="theme-text-primary font-semibold text-sm">
                      {comment.userName || "Anonymous"}
                      {comment.userId === eventCreatorId && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                          Organizer
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs theme-text-muted">
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.editedAt && (
                        <span className="flex items-center gap-1">
                          <Edit3 size={10} />
                          Edited
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {canModify(comment) && editingId !== comment.id && (
                  <div className="flex gap-1 shrink-0">
                    {comment.userId === currentUser?.uid && (
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content / Edit Mode */}
              {editingId === comment.id ? (
                <div className="ml-12">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full theme-input rounded-xl p-3 resize-none transition text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editText.trim()}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 text-xs"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="theme-text-secondary ml-12 text-sm leading-relaxed">{comment.text}</p>
              )}

              {/* Like Button */}
              <div className="ml-12 mt-3 flex items-center gap-3">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 text-xs transition px-2 py-1 rounded-lg ${
                    comment.likes?.includes(currentUser?.uid)
                      ? "text-green-400 bg-green-500/10"
                      : "theme-text-muted hover:text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{comment.likes?.length || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}