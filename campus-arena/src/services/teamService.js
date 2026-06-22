import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Create a new team for an event
 */
export const createTeam = async (eventId, { name, captainId, captainName, maxMembers }) => {
  const docRef = await addDoc(collection(db, "teams"), {
    eventId,
    name,
    captainId,
    captainName: captainName || "",
    maxMembers: maxMembers || 11,
    members: [{
      userId: captainId,
      userName: captainName || "",
      joinedAt: new Date(),
    }],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get all teams for an event
 */
export const getEventTeams = async (eventId) => {
  const q = query(collection(db, "teams"), where("eventId", "==", eventId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get team by ID
 */
export const getTeamById = async (teamId) => {
  const docSnap = await getDoc(doc(db, "teams", teamId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Join a team
 */
export const joinTeam = async (teamId, { userId, userName }) => {
  const team = await getTeamById(teamId);
  if (!team) throw new Error("Team not found.");

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    throw new Error("Team is full.");
  }

  // Check if user is already in a team for this event
  const teams = await getEventTeams(team.eventId);
  for (const t of teams) {
    if (t.members.some((m) => m.userId === userId)) {
      throw new Error("You are already in a team for this event.");
    }
  }

  await updateDoc(doc(db, "teams", teamId), {
    members: [...team.members, { userId, userName: userName || "", joinedAt: new Date() }],
  });
};

/**
 * Leave a team
 */
export const leaveTeam = async (teamId, userId) => {
  const team = await getTeamById(teamId);
  if (!team) throw new Error("Team not found.");

  // Captain cannot leave
  if (team.captainId === userId) {
    throw new Error("Team captain cannot leave. Transfer captaincy first.");
  }

  const updatedMembers = team.members.filter((m) => m.userId !== userId);
  await updateDoc(doc(db, "teams", teamId), { members: updatedMembers });
};

/**
 * Get the team a user is in for a specific event
 */
export const getUserTeamForEvent = async (eventId, userId) => {
  const teams = await getEventTeams(eventId);
  return teams.find((t) => t.members.some((m) => m.userId === userId)) || null;
};

/**
 * Delete a team (captain only)
 */
export const deleteTeam = async (teamId, userId) => {
  const team = await getTeamById(teamId);
  if (!team) throw new Error("Team not found.");
  if (team.captainId !== userId) throw new Error("Only the team captain can delete the team.");
  await deleteDoc(doc(db, "teams", teamId));
};

/**
 * Check if an event has a team structure (team sport)
 */
export const isTeamSport = (event) => {
  const teamSports = ["football", "soccer", "basketball", "volleyball", "cricket", "baseball", "hockey", "rugby", "handball", "kabaddi"];
  return teamSports.some((s) => event.sport?.toLowerCase().includes(s));
};