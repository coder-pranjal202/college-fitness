import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { alert("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { alert("Please enter your email address first."); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Campus <span className="text-green-400">Arena</span>
          </h1>

          <p className="text-gray-300 mt-2">
            Welcome back! Sign in to continue.
          </p>
        </div>

        {/* Email */}
        <div className="relative mb-4">
          <Mail
            className="absolute left-4 top-3.5 text-gray-400"
            size={20}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />
        </div>

        {/* Password */}
        <div className="relative mb-2">
          <Lock
            className="absolute left-4 top-3.5 text-gray-400"
            size={20}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold text-lg transition flex items-center justify-center gap-2 ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? <><Loader2 size={20} className="animate-spin" /> Signing in...</> : "Login"}
        </button>

        {resetSent && (
          <p className="text-green-400 text-sm text-center mt-3">✅ Password reset email sent! Check your inbox.</p>
        )}

        <div className="text-right mt-3">
          <button
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-sm text-green-400 hover:underline disabled:text-gray-500 transition"
          >
            {resetLoading ? "Sending..." : "Forgot Password?"}
          </button>
        </div>

        <p className="text-center text-gray-300 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}