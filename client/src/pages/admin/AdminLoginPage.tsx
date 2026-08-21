import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both administrative identifier and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.adminLogin({
        identifier: identifier.trim(),
        password,
      });

      if (res.data?.user) {
        setUser(res.data.user);
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to authenticate. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string = 'password123') => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-inner">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-serif font-bold tracking-tight text-white">
          Skincare Admin Portal
        </h2>
        <p className="mt-2 text-xs text-slate-400 tracking-wide uppercase font-mono">
          Enterprise Security &amp; Management Engine
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Identifier
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@skincare.com.bd or phone"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-slate-400">Remember this station</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Forgot credentials?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <KeyRound size={12} className="text-emerald-400" />
                Quick Role Credentials
              </span>
              <span className="text-[10px] text-slate-500 font-mono">dev testing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@skincare.com.bd', 'password123')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-emerald-400">Super Admin</p>
                <p className="text-[9px] text-slate-500 truncate">admin@skincare.com.bd</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('product@skincare.com.bd', 'password123')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-blue-400">Product Manager</p>
                <p className="text-[9px] text-slate-500 truncate">product@skincare.com.bd</p>
              </button>
            </div>
          </div>

          {/* Return to Storefront */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles size={12} className="text-emerald-400" />
            <span>End-to-End Encrypted Session &bull; RBAC Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
