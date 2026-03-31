import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Users, 
  Bell, 
  BarChart3, 
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, signInWithPopup } from '../firebase';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setLoginError('Login request was cancelled. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized for login. Please contact the administrator.');
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const partners = [
    "Infosys", "TCS", "Wipro", "Cognizant", "Accenture", "Google", "Microsoft", "Amazon"
  ];

  const features = [
    {
      title: "Proposal Submission",
      desc: "Easy-to-use interface for submitting project ideas with PPT/PDF support.",
      icon: <FileText className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Supervisor Assignment",
      desc: "Automated and manual assignment of students to expert supervisors.",
      icon: <Users className="w-8 h-8 text-purple-500" />
    },
    {
      title: "File Management",
      desc: "Secure storage and versioning for all your project reports and presentations.",
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />
    },
    {
      title: "Feedback System",
      desc: "Continuous communication channel between students and supervisors.",
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Real-time Tracking",
      desc: "Monitor project progress, status updates, and evaluation marks instantly.",
      icon: <BarChart3 className="w-8 h-8 text-red-500" />
    },
    {
      title: "Notifications",
      desc: "Stay updated with automated email alerts and in-app notifications.",
      icon: <Bell className="w-8 h-8 text-yellow-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">SVCE Portal</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-6">
            {user ? (
              <Link to="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
                Dashboard
              </Link>
            ) : (
              <button 
                onClick={handleLogin} 
                disabled={loginLoading}
                className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors ${loginLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LogIn className="w-4 h-4" />
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            )}
          </div>
          {loginError && (
            <p className="text-xs text-red-500 font-medium">{loginError}</p>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            SVCE Project <br />
            <span className="text-blue-600">Submission Portal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg">
            A centralized platform to manage, track, and evaluate capstone projects efficiently. Empowering students and faculty.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                  {profile?.role === 'student' && (
                    <Link to="/dashboard/proposals/new" className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all">
                      Propose Your Idea
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLogin} 
                    disabled={loginLoading}
                    className={`px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all ${loginLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loginLoading ? 'Logging in...' : 'Get Started'}
                  </button>
                  <button 
                    onClick={handleLogin} 
                    disabled={loginLoading}
                    className={`px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all ${loginLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Propose Your Idea
                  </button>
                </>
              )}
            </div>
            {loginError && !user && (
              <p className="text-sm text-red-500 font-medium">{loginError}</p>
            )}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="w-full aspect-square bg-blue-50 rounded-3xl overflow-hidden flex items-center justify-center p-12">
            <img 
              src="https://picsum.photos/seed/education/800/800" 
              alt="Education Illustration" 
              className="rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projects Approved</p>
                <p className="text-xl font-bold">1,240+</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partner Section */}
      <section className="bg-gray-50 py-12 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...partners, ...partners].map((partner, i) => (
            <span key={i} className="mx-12 text-2xl font-bold text-gray-300 uppercase tracking-widest">
              {partner}
            </span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage the entire project lifecycle from initial proposal to final evaluation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">SVCE Portal</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Sri Venkateswara College of Engineering. <br />
              Department of Computer Science & Engineering.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/propose" className="hover:text-white">Propose Idea</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-400">
              <li>hod.cse@svce.edu</li>
              <li>+91 44 2715 2000</li>
              <li>Sriperumbudur, Tamil Nadu</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Social</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Users className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © 2026 SVCE Project Submission Portal. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
