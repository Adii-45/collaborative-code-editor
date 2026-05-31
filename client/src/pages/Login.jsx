import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Github } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Pane - Dark Theme & Hero Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0D14] flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Graphic */}
        <div className="relative z-10 w-full max-w-lg mb-8">
          <img src="/auth-hero.png" alt="Code Editor Interface" className="w-full h-auto drop-shadow-2xl" />
        </div>
        
        {/* Text */}
        <h2 className="relative z-10 text-white text-[40px] font-bold text-center tracking-tight leading-tight px-12">
          Code at the speed<br />of thought.
        </h2>
      </div>

      {/* Right Pane - Light Theme Form */}
      <div className="w-full lg:w-1/2 bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h1 className="text-[32px] font-bold text-slate-900 mb-8 tracking-tight">Sign in to CodeCloud.</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[15px] font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[15px] font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all pr-12 placeholder:text-slate-400"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign in'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "http://localhost:8001/api/auth/github";
              }}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
          </form>
          
          <p className="text-center text-slate-500 text-[15px] mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#3b82f6] hover:text-blue-600 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
