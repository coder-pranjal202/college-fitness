import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

/**
 * Register for an event
 */
export const registerForEvent = async (userId, userName, eventId) => {
  // Check if already registered
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    throw new Error("You have already registered for this event.");
  }

  // Check max participants
  const eventDoc = await getDoc(doc(db, "events", eventId));
  if (eventDoc.exists()) {
    const event = eventDoc.data();
    if (event.maxParticipants) {
      const regCount = await getRegistrationCount(eventId);
      if (regCount >= event.maxParticipants) {
        throw new Error("Event is full. No more registrations available.");
      }
    }
  }

  await addDoc(collection(db, "registrations"), {
    userId,
    userName: userName || "",
    eventId,
    registeredAt: serverTimestamp(),
  });
};

/**
 * Cancel registration for an event
 */
export const cancelRegistration = async (userId, eventId) => {
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Registration not found.");
  }

  await deleteDoc(doc(db, "registrations", snapshot.docs[0].id));
};

/**
 * Check if a user is registered for a specific event
 */
export const isUserRegistered = async (userId, eventId) => {
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Get all registrations of a specific user
 */
export const getMyRegistrations = async (userId) => {
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get all registrations for a specific event
 */
export const getEventRegistrations = async (eventId) => {
  const q = query(
    collection(db, "registrations"),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get registration count for an event
 */
export const getRegistrationCount = async (eventId) => {
  const q = query(
    collection(db, "registrations"),
    where("eventId", "==", eventId)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};