import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { createUserProfile } from "../services/userService";
import { User, GraduationCap, Mail, Lock } from "lucide-react";

const MODULES = ["B.Tech", "Diploma", "M.Tech", "PhD"];
const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [module, setModule] = useState("");
  const [semester, setSemester] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !department || !module || !semester || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await registerUser(email, password);

      await createUserProfile(
        userCredential.user.uid,
        name,
        email,
        department,
        module,
        semester
      );

      alert("Account Created Successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Campus <span className="text-green-400">Arena</span>
          </h1>

          <p className="text-gray-300 mt-2">
            Create your account and join campus sports.
          </p>
        </div>

        {/* Name */}
        <div className="relative mb-4">
          <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />
        </div>

        {/* Department */}
        <div className="relative mb-4">
          <GraduationCap className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Department (e.g. Computer Science)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />
        </div>

        {/* Module & Semester Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Program</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 appearance-none"
            >
              <option value="" className="bg-slate-900">Select Program</option>
              {MODULES.map((m) => (
                <option key={m} value={m} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 appearance-none"
            >
              <option value="" className="bg-slate-900">Select</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="relative mb-4">
          <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />
        </div>

        {/* Password */}
        <div className="relative mb-6">
          <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 hover:bg-green-600 transition duration-300 py-3 rounded-xl text-white font-semibold text-lg"
        >
          Create Account
        </button>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}