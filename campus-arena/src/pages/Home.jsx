import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Trophy, Users, Calendar, Shield, Mail, MapPin, Phone, ChevronRight, Sparkles, ArrowRight, Zap, Target, Award } from "lucide-react";

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
  { icon: Trophy, title: "Create Events", desc: "Organize sports tournaments and events with just a few clicks.", color: "from-blue-600 to-indigo-700" },
  { icon: Users, title: "Build Teams", desc: "Form teams, invite players, and manage your squad roster.", color: "from-blue-500 to-blue-700" },
  { icon: Calendar, title: "Register Easily", desc: "Sign up for events in seconds and track your participation.", color: "from-indigo-500 to-purple-600" },
  { icon: Shield, title: "Compete & Win", desc: "Track scores, view leaderboards, and earn recognition.", color: "from-blue-600 to-teal-600" },
];

const stats = [
  { value: "50+", label: "Events Hosted", icon: "🎯" },
  { value: "500+", label: "Active Students", icon: "👥" },
  { value: "8+", label: "Sports Categories", icon: "🏆" },
  { value: "15+", label: "Partner Colleges", icon: "🏫" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrolled(window.scrollY > 20);
      setScrollProgress(Number(scroll));

      // Scroll reveal animation
      const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('revealed');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen theme-page overflow-x-hidden">
      {/* Progress Bar */}
      <div 
        className="progress-bar" 
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'theme-navbar shadow-lg shadow-black/20 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-all duration-300 group-hover:scale-105">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                <span className="text-blue-600">Campus</span>
                <span className="theme-text-primary">Arena</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="theme-text-secondary hover:text-blue-600 font-semibold transition-colors relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#sports" className="theme-text-secondary hover:text-blue-600 font-semibold transition-colors relative group">
                Sports
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#features" className="theme-text-secondary hover:text-blue-600 font-semibold transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#contact" className="theme-text-secondary hover:text-blue-600 font-semibold transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            </div>


            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden theme-text-primary p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden theme-card border-t theme-separator mt-4 mx-4 rounded-2xl p-6 animate-fade-in-up">
            <div className="flex flex-col gap-4">
              <a href="#about" onClick={() => setMenuOpen(false)} className="theme-text-secondary hover:text-blue-600 font-semibold py-2 transition-colors">About</a>
              <a href="#sports" onClick={() => setMenuOpen(false)} className="theme-text-secondary hover:text-blue-600 font-semibold py-2 transition-colors">Sports</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="theme-text-secondary hover:text-blue-600 font-semibold py-2 transition-colors">Features</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="theme-text-secondary hover:text-blue-600 font-semibold py-2 transition-colors">Contact</a>
              <hr className="theme-separator my-2" />
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 dark:text-blue-400 text-sm font-bold">
              #1 College Fitness Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight theme-text-primary mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your Campus.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Your Game.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl theme-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The ultimate platform for college fitness & sports. Create tournaments, build teams, 
            track scores, and compete with students across your campus.
          </p>


          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="theme-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-600/30">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-black text-blue-600">{stat.value}</div>
                <div className="theme-text-muted text-sm font-semibold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-600/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black theme-text-primary mb-4">
            Why <span className="text-blue-600">Campus Arena</span>?
          </h2>
          <p className="theme-text-secondary max-w-2xl mx-auto text-lg">
            Everything you need to manage and participate in college sports events.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="theme-card rounded-2xl p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold theme-text-primary mb-3">{feature.title}</h3>
              <p className="theme-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="theme-card rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                About Us
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black theme-text-primary mb-6">
                Built for Students,<br />
                <span className="text-blue-600">By Students</span>
              </h2>
              <div className="space-y-4 theme-text-secondary text-lg leading-relaxed">
                <p>
                  Campus Arena is the dedicated sports & fitness event management platform designed to 
                  revolutionize how college sports are organized and experienced.
                </p>
                <p>
                  We provide a centralized hub where students can discover upcoming sports events, 
                  register with a single click, form teams, track scores, and stay connected with 
                  their campus sports community.
                </p>
                <p>
                  Whether you're a casual player looking for a friendly match or a competitive 
                  athlete aiming for the championship, Campus Arena brings the entire campus 
                  sports ecosystem to your fingertips.
                </p>
              </div>

              {/* Value Cards */}
              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="theme-card-inner rounded-xl p-5 text-center hover:scale-105 transition-transform">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm theme-text-primary font-bold">Mission</p>
                  <p className="text-xs theme-text-muted mt-1">Unite campus through sports</p>
                </div>
                <div className="theme-card-inner rounded-xl p-5 text-center hover:scale-105 transition-transform">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm theme-text-primary font-bold">Vision</p>
                  <p className="text-xs theme-text-muted mt-1">Every student plays</p>
                </div>
                <div className="theme-card-inner rounded-xl p-5 text-center hover:scale-105 transition-transform">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm theme-text-primary font-bold">Community</p>
                  <p className="text-xs theme-text-muted mt-1">500+ active members</p>
                </div>
                <div className="theme-card-inner rounded-xl p-5 text-center hover:scale-105 transition-transform">
                  <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm theme-text-primary font-bold">Events</p>
                  <p className="text-xs theme-text-muted mt-1">50+ hosted yearly</p>
                </div>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="theme-card-inner rounded-3xl p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-float">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold theme-text-primary mb-3">Join the Arena</h3>
                  <p className="theme-text-muted mb-6 max-w-sm mx-auto">
                    Be part of the most active campus sports community. Register now and start your journey.
                  </p>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPORTS SECTION ===== */}
      <section id="sports" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
            Sports
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black theme-text-primary mb-4">
            Sports We <span className="text-blue-600">Cover</span>
          </h2>
          <p className="theme-text-secondary max-w-2xl mx-auto text-lg">
            From the field to the court, we've got a wide range of sports for every athlete.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sportsList.map((sport, idx) => (
            <div
              key={idx}
              className="theme-card rounded-2xl p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer hover:border-blue-600/30"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {sport.emoji}
              </div>
              <h3 className="text-xl font-bold theme-text-primary mb-2">{sport.name}</h3>
              <p className="theme-text-muted text-sm leading-relaxed">{sport.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="theme-card rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <span className="inline-block bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                Contact
              </span>
              <h2 className="text-3xl sm:text-4xl font-black theme-text-primary mb-4">
                Get in <span className="text-blue-600">Touch</span>
              </h2>
              <p className="theme-text-secondary text-lg mb-8">
                Have questions, suggestions, or want to organize an event? 
                We'd love to hear from you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Email</p>
                    <p className="theme-text-muted text-sm">campusevents2026@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Location</p>
                    <p className="theme-text-muted text-sm">University Campus</p>
                    <p className="theme-text-muted text-sm">Student Activity Center, Room 101</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold theme-text-primary">Phone</p>
                    <p className="theme-text-muted text-sm">+91 6001278436</p>
                    <p className="theme-text-muted text-sm">Mon-Fri, 9 AM - 5 PM</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-10">
                {['📘', '📸', '🐦', '💬'].map((emoji, idx) => (
                  <div 
                    key={idx}
                    className="w-12 h-12 theme-card-inner rounded-xl flex items-center justify-center hover:bg-blue-600/20 transition-colors cursor-pointer text-xl"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="theme-card-inner rounded-2xl p-8">
              <h3 className="text-xl font-bold theme-text-primary mb-6">Send us a Message</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for your message! We'll get back to you soon.");
                  e.target.reset();
                }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full theme-input rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full theme-input rounded-xl px-4 py-3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-text-secondary mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    className="w-full theme-input rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-text-secondary mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message here..."
                    className="w-full theme-input rounded-xl px-4 py-3 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02]"
                >
                  Send Message <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t theme-separator px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-blue-600">Campus</span>
                  <span className="theme-text-primary">Arena</span>
                </span>
              </div>
              <p className="theme-text-muted max-w-sm">
                The ultimate platform for college fitness & sports. Connect, compete, and celebrate with your campus community.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold theme-text-primary mb-4">Quick Links</h4>
              <div className="flex flex-col gap-3">
                <a href="#about" className="theme-text-muted hover:text-blue-600 transition-colors">About</a>
                <a href="#sports" className="theme-text-muted hover:text-blue-600 transition-colors">Sports</a>
                <a href="#features" className="theme-text-muted hover:text-blue-600 transition-colors">Features</a>
                <a href="#contact" className="theme-text-muted hover:text-blue-600 transition-colors">Contact</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold theme-text-primary mb-4">Legal</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="theme-text-muted hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="theme-text-muted hover:text-blue-600 transition-colors">Terms of Service</a>
                <a href="#" className="theme-text-muted hover:text-blue-600 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t theme-separator pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="theme-text-muted text-sm">
              © 2026 <span className="text-blue-600 font-bold">Campus Arena</span>. All rights reserved.
            </p>
            <p className="theme-text-muted text-sm">
              Built with ❤️ for college athletes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}