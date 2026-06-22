import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserProfile = async (
  uid,
  name,
  email,
  department,
  module = "",
  semester = ""
) => {
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    department,
    module,
    semester,
    role: "student",
    createdAt: new Date(),
  });
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};