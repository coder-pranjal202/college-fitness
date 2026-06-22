import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

/**
 * Add a comment to an event
 */
export const addComment = async (eventId, userId, userName, userPhotoURL, text) => {
  if (!text.trim()) {
    throw new Error("Comment cannot be empty.");
  }

  const docRef = await addDoc(collection(db, "comments"), {
    eventId,
    userId,
    userName: userName || "Anonymous",
    userPhotoURL: userPhotoURL || "",
    text: text.trim(),
    createdAt: serverTimestamp(),
    editedAt: null,
    likes: [],
    parentId: null, // for nested replies (future use)
  });

  return docRef.id;
};

/**
 * Delete a comment (only by the comment author or event organizer/admin)
 */
export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, "comments", commentId));
};

/**
 * Edit a comment
 */
export const editComment = async (commentId, newText) => {
  if (!newText.trim()) {
    throw new Error("Comment cannot be empty.");
  }

  await updateDoc(doc(db, "comments", commentId), {
    text: newText.trim(),
    editedAt: serverTimestamp(),
  });
};

/**
 * Toggle like on a comment
 */
export const toggleLikeComment = async (commentId, userId) => {
  const commentRef = doc(db, "comments", commentId);
  const commentSnap = await getDoc(commentRef);

  if (!commentSnap.exists()) {
    throw new Error("Comment not found.");
  }

  const comment = commentSnap.data();
  const likes = comment.likes || [];

  if (likes.includes(userId)) {
    // Unlike
    await updateDoc(commentRef, {
      likes: likes.filter((id) => id !== userId),
    });
  } else {
    // Like
    await updateDoc(commentRef, {
      likes: [...likes, userId],
    });
  }
};

/**
 * Get all comments for an event, ordered by newest first
 */
export const getEventComments = async (eventId) => {
  const q = query(
    collection(db, "comments"),
    where("eventId", "==", eventId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      editedAt: doc.data().editedAt?.toDate?.()?.toISOString() || null,
    }))
    .sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first
    });
};

/**
 * Get comment count for an event
 */
export const getCommentCount = async (eventId) => {
  const q = query(
    collection(db, "comments"),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};