import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { createNotification } from "./notificationService";

/**
 * Submit a new organizer request
 */
export const submitOrganizerRequest = async (userId, { name, email, sport, reason, experience }) => {
  await addDoc(collection(db, "organizerRequests"), {
    userId,
    name: name || "",
    email: email || "",
    sport,
    reason,
    experience: experience || "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

/**
 * Get all organizer requests
 */
export const getAllRequests = async () => {
  const snapshot = await getDocs(collection(db, "organizerRequests"));
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data.reverse();
};

/**
 * Approve a request: change user role + mark request approved + notify user
 */
export const approveRequest = async (requestId, userId, userName) => {
  await updateDoc(doc(db, "users", userId), { role: "organizer" });
  await updateDoc(doc(db, "organizerRequests", requestId), { status: "approved" });

  // Send notification to user
  await createNotification(userId, {
    title: "Request Approved! 🎉",
    message: `Congratulations ${userName || "User"}! Your organizer request has been approved. You can now create and manage events.`,
    type: "success",
    link: "/organizer-dashboard",
  });
};

/**
 * Reject a request + notify user
 */
export const rejectRequest = async (requestId, userId, userName) => {
  await updateDoc(doc(db, "organizerRequests", requestId), { status: "rejected" });

  // Send notification to user
  await createNotification(userId, {
    title: "Request Rejected",
    message: `Hi ${userName || "User"}, unfortunately your organizer request has been rejected. Please contact the admin for more details.`,
    type: "error",
    link: "/request-organizer",
  });
};

/**
 * Check if user has a pending request
 */
export const hasPendingRequest = async (userId) => {
  const q = query(
    collection(db, "organizerRequests"),
    where("userId", "==", userId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
