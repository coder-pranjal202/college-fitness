import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get all events
 */
export const getEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get a single event by ID
 */
export const getEventById = async (eventId) => {
  const docSnap = await getDoc(doc(db, "events", eventId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Get events created by a specific user (organizer)
 */
export const getMyEvents = async (userId) => {
  const q = query(collection(db, "events"), where("createdBy", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    createdAt: new Date(),
  });
  return docRef.id;
};

/**
 * Update an existing event
 */
export const updateEvent = async (eventId, eventData) => {
  await updateDoc(doc(db, "events", eventId), eventData);
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, "events", eventId));
};