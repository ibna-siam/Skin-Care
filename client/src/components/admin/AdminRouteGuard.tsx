import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ShieldAlert, LogOut, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_STAFF'];

export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, fetchUser, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loaded yet, fetch user
    if (!user && isLoading) {
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Verifying Administrative Credentials...</p>
      </div>
    );
  }

  // 1. If unauthenticated -> redirect to /admin/login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 2. If authenticated but regular CUSTOMER -> Show 403 Forbidden Access Denied
  if (!ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono mb-3 border border-rose-500/20">
            <span>HTTP 403: ACCESS FORBIDDEN</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            Administrative Access Required
          </h2>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            You are currently signed in as <span className="text-slate-200 font-semibold">{user.email}</span> with role <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">{user.role}</span>. This administrative portal is restricted to authorized personnel only.
          </p>

          <div className="space-y-3">
            <button
              onClick={async () => {
                await logout();
                navigate('/admin/login', { replace: true });
              }}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <LogOut size={16} />
              <span>Switch to Admin Account</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <ArrowLeft size={16} />
              <span>Return to Storefront</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles size={12} className="text-emerald-400" />
              <span>Skincare Bangladesh Enterprise Security Engine</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin -> render protected view
  return <>{children}</>;
};
