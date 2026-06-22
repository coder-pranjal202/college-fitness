import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Trophy, Users, Calendar, Shield, Mail, MapPin, Phone, ChevronRight } from "lucide-react";

const sportsList = [
  { name: "Cricket", emoji: "🏏", desc: "Test matches, T20 tournaments, and friendly games on the campus ground." },
  { name: "Football", emoji: "⚽", desc: "5-a-side and 11-a-side tournaments across multiple campus fields." },
  { name: "Basketball", emoji: "🏀", desc: "Indoor and outdoor basketball leagues and 3x3 competitions." },
  { name: "Volleyball", emoji: "🏐", desc: "Beach volleyball and indoor court tournaments throughout the year." },
  { name: "Badminton", emoji: "🏸", desc: "Singles and doubles badminton matches in the indoor sports complex." },
  { name: "Athletics", emoji: "🏃", desc: "Track events, marathons, relay races, and field events." },
  { name: "Table Tennis", emoji: "🏓", desc: "Fast-paced table tennis singles and doubles championships." },
  { name: "Chess", emoji: "♟️", desc: "Strategic chess tournaments with both classical and rapid formats." },
];

const features = [
  { icon: Trophy, title: "Create Events", desc: "Organize sports tournaments and events with just a few clicks." },
  { icon: Users, title: "Build Teams", desc: "Form teams, invite players, and manage your squad roster." },
  { icon: Calendar, title: "Register Easily", desc: "Sign up for events in seconds and track your participation." },
  { icon: Shield, title: "Compete & Win", desc: "Track scores, view leaderboards, and earn recognition." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen theme-page">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-b theme-separator">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide theme-text-primary">
          <span className="text-green-400">Campus</span> Arena
        </h1>

        {/* Desktop Nav */}
        <div className="hidden sm:flex gap-8 items-center">
          <a href="#about" className="theme-text-muted hover:text-green-400 transition">About</a>
          <a href="#sports" className="theme-text-muted hover:text-green-400 transition">Sports</a>
          <a href="#contact" className="theme-text-muted hover:text-green-400 transition">Contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden theme-text-muted hover:theme-text-primary transition"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden theme-card border-b theme-separator px-4 py-4 flex flex-col gap-3 text-center">
          <a href="#about" className="theme-text-muted hover:text-green-400 transition py-2" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#sports" className="theme-text-muted hover:text-green-400 transition py-2" onClick={() => setMenuOpen(false)}>Sports</a>
          <a href="#contact" className="theme-text-muted hover:text-green-400 transition py-2" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-28">
        <div className="inline-block bg-green-500/10 border border-green-500/30 px-4 py-1.5 rounded-full text-green-400 text-sm font-semibold mb-6">
          🎯 Campus Sports Platform
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight theme-text-primary">
          Your Campus.
          <br />
          <span className="text-green-400">Your Game.</span>
        </h1>

        <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg theme-text-secondary px-2">
          Participate in sports events, register online,
          create tournaments, join teams, become an organizer,
          and compete with students across your campus.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center px-4 sm:px-0">
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-center text-lg"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border border-green-500 text-green-400 px-8 py-4 rounded-xl font-semibold text-center text-lg hover:bg-green-500 hover:text-white transition"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-green-400">50+</p>
            <p className="theme-text-muted text-sm mt-1">Events Hosted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-green-400">500+</p>
            <p className="theme-text-muted text-sm mt-1">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-green-400">8+</p>
            <p className="theme-text-muted text-sm mt-1">Sports Categories</p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="px-4 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center theme-text-primary mb-4">
          Why <span className="text-green-400">Campus Arena</span>?
        </h2>
        <p className="theme-text-muted text-center max-w-xl mx-auto mb-12">
          Everything you need to manage and participate in campus sports events.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="theme-card rounded-2xl p-6 text-center hover:scale-105 transition">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon size={28} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold theme-text-primary mb-2">{feature.title}</h3>
              <p className="theme-text-muted text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="px-4 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="theme-card rounded-3xl p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary mb-6">
                About <span className="text-green-400">Campus Arena</span>
              </h2>
              <div className="space-y-4 theme-text-secondary">
                <p>
                  Campus Arena is a dedicated sports event management platform built for students, by students. 
                  Our mission is to make campus sports accessible, organized, and competitive.
                </p>
                <p>
                  We provide a centralized hub where students can discover upcoming sports events, 
                  register with a single click, form teams, track scores, and stay connected with 
                  their campus sports community.
                </p>
                <p>
                  Whether you're a casual player looking for a friendly match or a competitive athlete 
                  aiming for the championship, Campus Arena brings the entire campus sports ecosystem 
                  to your fingertips.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="theme-card-inner rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">🎯</p>
                  <p className="text-sm theme-text-primary font-semibold mt-1">Mission</p>
                  <p className="text-xs theme-text-muted mt-1">Unite campus through sports</p>
                </div>
                <div className="theme-card-inner rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">👁️</p>
                  <p className="text-sm theme-text-primary font-semibold mt-1">Vision</p>
                  <p className="text-xs theme-text-muted mt-1">Every student plays</p>
                </div>
                <div className="theme-card-inner rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">🤝</p>
                  <p className="text-sm theme-text-primary font-semibold mt-1">Community</p>
                  <p className="text-xs theme-text-muted mt-1">500+ active members</p>
                </div>
                <div className="theme-card-inner rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">🏆</p>
                  <p className="text-sm theme-text-primary font-semibold mt-1">Events</p>
                  <p className="text-xs theme-text-muted mt-1">50+ hosted yearly</p>
                </div>
              </div>
            </div>

            <div className="theme-card-inner rounded-2xl p-8 text-center">
              <Trophy size={80} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-bold theme-text-primary mb-3">Join the Arena</h3>
              <p className="theme-text-muted text-sm mb-2">
                Be part of the most active campus sports community. Register now and start your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPORTS SECTION ===== */}
      <section id="sports" className="px-4 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center theme-text-primary mb-4">
          Sports We <span className="text-green-400">Cover</span>
        </h2>
        <p className="theme-text-muted text-center max-w-xl mx-auto mb-12">
          From the field to the court, we've got a wide range of sports for every athlete.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sportsList.map((sport, idx) => (
            <div
              key={idx}
              className="theme-card rounded-2xl p-5 hover:scale-105 transition group cursor-default"
            >
              <div className="text-4xl mb-3">{sport.emoji}</div>
              <h3 className="text-lg font-bold theme-text-primary mb-2">{sport.name}</h3>
              <p className="theme-text-muted text-sm leading-relaxed">{sport.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="px-4 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="theme-card rounded-3xl p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold theme-text-primary mb-6">
                Get in <span className="text-green-400">Touch</span>
              </h2>
              <p className="theme-text-secondary mb-8">
                Have questions, suggestions, or want to organize an event? We'd love to hear from you.
                Reach out to us through any of the channels below.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Email</p>
                    <p className="theme-text-muted text-sm">supportcampusarena@gmail.com</p>
                    <p className="theme-text-muted text-sm">events@campusarena.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Location</p>
                    <p className="theme-text-muted text-sm">University Campus</p>
                    <p className="theme-text-muted text-sm">Student Activity Center, Room 101</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Phone</p>
                    <p className="theme-text-muted text-sm">+91 7099468315</p>
                    <p className="theme-text-muted text-sm">Mon-Fri, 9 AM - 5 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition cursor-pointer">
                  <span className="text-lg">📘</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition cursor-pointer">
                  <span className="text-lg">📸</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition cursor-pointer">
                  <span className="text-lg">🐦</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition cursor-pointer">
                  <span className="text-lg">💬</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="theme-card-inner rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold theme-text-primary mb-6">Send us a Message</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for your message! We'll get back to you soon.");
                  e.target.reset();
                }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm theme-text-muted mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full theme-input rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm theme-text-muted mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full theme-input rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    className="w-full theme-input rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm theme-text-muted mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message here..."
                    className="w-full theme-input rounded-xl px-4 py-3 text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  Send Message <ChevronRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


      {/* ===== FOOTER ===== */}
      <footer className="border-t theme-separator px-4 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="theme-text-muted text-sm">
            © 2026 <span className="text-green-400 font-semibold">Campus Arena</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#about" className="theme-text-muted hover:text-green-400 transition">About</a>
            <a href="#sports" className="theme-text-muted hover:text-green-400 transition">Sports</a>
            <a href="#contact" className="theme-text-muted hover:text-green-400 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}