import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, Sparkles, Mail, Bell, Users } from 'lucide-react';
//@ts-ignore
import business from '../assets/business.jpg';
//@ts-ignore
import so from '../assets/so.jpg';


export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[700px] flex items-center bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 z-10"
          >
            <span className="inline-block py-1 px-3 mb-6 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-widest rounded-full">
              Make the best choice
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight mb-6 leading-[1.1]">
              Find your <span className="text-surface-tint">dream job</span> with curated precision.
            </h1>
            <p className="text-lg text-secondary mb-10 max-w-xl leading-relaxed">
              Moving beyond spreadsheets. We treat your career journey as a high-end editorial dossier, matching you with opportunities that value your unique narrative.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="hero-gradient text-white px-8 py-4 rounded-full font-semibold text-base shadow-lg hover:opacity-90 transition-all active:scale-95">
                Sign Up
              </Link>
              <Link to="/login" className="bg-surface-container-low text-on-surface px-8 py-4 rounded-full font-semibold text-base border border-outline-variant/20 hover:bg-surface-container transition-all active:scale-95">
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5 relative"
          >
            <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden editorial-shadow">
              <img alt="Business picture"
                className="w-full h-full object-cover"
                src="/src/assets/mo.jpg"
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/70 backdrop-blur-md rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-on-tertiary-container" size={20} />

                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-tertiary-fixed rounded-full flex items-center justify-center -z-10 blur-2xl opacity-50"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-4 leading-tight">Quiet Intelligence for the Modern Professional</h2>
              <p className="text-secondary">Our platform eliminates the noise of traditional job boards, focusing on high-signal connections.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-surface-container-lowest p-10 rounded-[2rem] editorial-shadow flex flex-col justify-between h-[400px]"
            >
              <div>
                <div className="w-12 h-12 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8">
                  <Sparkles className="text-on-primary-fixed-variant" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Personalized Job Matching</h3>
                <p className="text-secondary max-w-md">Our algorithm analyzes your portfolio and experience to suggest roles that aren't just a fit on paper, but a fit for your career trajectory.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-tertiary-fixed text-[10px] font-bold rounded-full">AI DRIVEN</span>
                <span className="px-3 py-1 bg-surface-container text-[10px] font-bold rounded-full">CURATED</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-surface-tint p-10 rounded-[2rem] shadow-xl flex flex-col justify-between h-[400px] text-white"
            >
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <Mail className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Direct Contact</h3>
                <p className="text-white/80">Skip the void. Message recruiters and hiring managers directly through our secure, editorial interface.</p>
              </div>
              <button className="bg-white text-surface-tint px-6 py-3 rounded-full font-bold text-sm w-fit active:scale-95 transition-transform">Get Started</button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-surface-container-highest p-10 rounded-[2rem] flex flex-col justify-between h-[400px]"
            >
              <div>
                <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center mb-8">
                  <Bell className="text-on-surface-variant" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Real-time Notifications</h3>
                <p className="text-secondary">Never miss a beat. Instant updates on application status, interview requests, and new curated matches.</p>
              </div>
              <div className="relative h-24 overflow-hidden rounded-xl bg-white/50 p-4">
                <div className="flex items-center gap-3 mb-3 bg-white p-2 rounded-lg shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-on-surface">New Message: Global Media Corp</span>
                </div>
                <div className="flex items-center gap-3 opacity-40 bg-white p-2 rounded-lg shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-on-surface">Match: Senior Art Director</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 overflow-hidden rounded-[2rem] relative h-[400px]"
            >
              <img
                alt="Team"
                className="w-full h-full object-cover"
                src={so}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="hero-gradient rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 relative z-10">Ready to build your dossier?</h2>
            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">Join 10,000+ professionals who have found their next major career move through EditorialRecruiter.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/register" className="bg-white text-primary-container px-10 py-4 rounded-full font-bold text-lg active:scale-95 transition-transform shadow-xl">
                Create Free Account
              </Link>
              <button className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 active:scale-95 transition-transform">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
