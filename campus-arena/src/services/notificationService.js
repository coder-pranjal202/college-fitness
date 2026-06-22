import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  getCountFromServer,
  limit,
} from "firebase/firestore";

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, { title, message, type, link }) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    title,
    message,
    type: type || "info", // info, success, warning, error
    link: link || "",
    read: false,
    createdAt: serverTimestamp(),
  });
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

/**
 * Get all notifications for a user (newest first)
 */
export const getUserNotifications = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime; // newest first
    });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId) => {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((d) =>
    updateDoc(doc(db, "notifications", d.id), { read: true })
  );
  await Promise.all(updates);
};