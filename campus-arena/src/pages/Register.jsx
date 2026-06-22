import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { createUserProfile } from "../services/userService";
import { User, GraduationCap, Mail, Lock, ArrowLeft, Trophy, CheckCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!name || !department || !module || !semester || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
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

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-page flex items-center justify-center px-4 py-12">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 theme-text-muted hover:text-emerald-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Card */}
        <div className="theme-card rounded-3xl p-8 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black theme-text-primary">
              Create <span className="text-emerald-500">Account</span>
            </h1>
            <p className="theme-text-secondary mt-2">
              Join Campus Arena and start competing
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm mb-4 animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full theme-input rounded-xl pl-12 pr-4 py-3"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Department
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-3.5 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full theme-input rounded-xl pl-12 pr-4 py-3"
                />
              </div>
            </div>

            {/* Module & Semester Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Program
                </label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full theme-input rounded-xl px-4 py-3 appearance-none"
                >
                  <option value="">Select Program</option>
                  {MODULES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full theme-input rounded-xl px-4 py-3 appearance-none"
                >
                  <option value="">Select</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-muted w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full theme-input rounded-xl pl-12 pr-4 py-3"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-muted w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full theme-input rounded-xl pl-12 pr-4 py-3"
                />
              </div>
              <p className="text-xs theme-text-muted mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t theme-separator" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 theme-card rounded-full theme-text-muted">or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center theme-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-500 hover:text-emerald-600 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center theme-text-muted text-sm mt-6">
          By creating an account, you agree to our{" "}
          <a href="#" className="underline hover:text-emerald-500 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-emerald-500 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}