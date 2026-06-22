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
} from "firebase/firestore";

/**
 * Set or update the winner/result info for an event (stored on the event doc itself)
 */
export const setEventResult = async (eventId, resultData) => {
  await updateDoc(doc(db, "events", eventId), {
    hasResult: true,
    winnerName: resultData.winnerName || "",
    winnerScore: resultData.winnerScore || "",
    runnerUpName: resultData.runnerUpName || "",
    runnerUpScore: resultData.runnerUpScore || "",
    resultSummary: resultData.resultSummary || "",
    resultUpdatedAt: serverTimestamp(),
  });
};

/**
 * Clear the result for an event
 */
export const clearEventResult = async (eventId) => {
  await updateDoc(doc(db, "events", eventId), {
    hasResult: false,
    winnerName: "",
    winnerScore: "",
    runnerUpName: "",
    runnerUpScore: "",
    resultSummary: "",
    resultUpdatedAt: null,
  });
};

/**
 * Add a score entry for a specific participant in an event
 */
export const addParticipantScore = async (eventId, userId, userName, score, notes) => {
  const docRef = await addDoc(collection(db, "scores"), {
    eventId,
    userId,
    userName: userName || "Anonymous",
    score: score || 0,
    notes: notes || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a participant's score
 */
export const updateParticipantScore = async (scoreId, score, notes) => {
  await updateDoc(doc(db, "scores", scoreId), {
    score,
    notes: notes || "",
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a participant score entry
 */
export const deleteParticipantScore = async (scoreId) => {
  await deleteDoc(doc(db, "scores", scoreId));
};

/**
 * Get all scores for an event, ordered by score descending
 */
export const getEventScores = async (eventId) => {
  const q = query(
    collection(db, "scores"),
    where("eventId", "==", eventId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Get a specific participant's score for an event
 */
export const getUserScore = async (eventId, userId) => {
  const q = query(
    collection(db, "scores"),
    where("eventId", "==", eventId),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
};