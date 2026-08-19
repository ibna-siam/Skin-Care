import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredSkinType, setPreferredSkinType] = useState('Normal');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(authModalTab);
    setError(null);
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.login({ identifier, password });
      if (res.data?.user) {
        setUser(res.data.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.register({
        name,
        email,
        phone,
        password,
        preferredSkinType,
      });
      if (res.data?.user) {
        setUser(res.data.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check form details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeAuthModal} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-cream-300 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-cream-100/60">
          <div>
            <span className="font-serif italic text-2xl font-bold text-brand-800">Skincare</span>
            <p className="text-xs text-gray-500 mt-0.5">Authentic skincare for real skin</p>
          </div>
          <button onClick={closeAuthModal} className="p-1.5 rounded-full text-gray-400 hover:text-charcoal-800 hover:bg-cream-200">
            <X size={20} />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors text-center ${
              activeTab === 'login'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 bg-cream-50 hover:text-charcoal-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors text-center ${
              activeTab === 'register'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 bg-cream-50 hover:text-charcoal-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. customer@example.com or 01712345678"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email/phone.'); }} className="text-xs font-medium text-brand-800 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800"
                />
              </div>

              {/* Demo Admin credentials pill */}
              <div className="p-2.5 bg-brand-50/70 border border-brand-200/60 rounded-xl text-[11px] text-brand-900 space-y-1">
                <span className="font-semibold block">Demo Admin Credentials:</span>
                <div>Email: <code className="font-mono bg-white px-1 py-0.5 rounded">admin@example.com</code></div>
                <div>Password: <code className="font-mono bg-white px-1 py-0.5 rounded">ChangeMe123!</code></div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Rahman"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ayesha@example.com"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Phone (Bangladesh)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Preferred Skin Type
                </label>
                <select
                  value={preferredSkinType}
                  onChange={(e) => setPreferredSkinType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                >
                  <option value="Normal">Normal Skin</option>
                  <option value="Oily">Oily Skin</option>
                  <option value="Dry">Dry Skin</option>
                  <option value="Combination">Combination Skin</option>
                  <option value="Sensitive">Sensitive Skin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
