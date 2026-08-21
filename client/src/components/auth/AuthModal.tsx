import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    authModalTab === 'forgot' ? 'login' : authModalTab
  );

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredSkinType, setPreferredSkinType] = useState('Normal');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '324075374263-4bnd9hdjr7v1vii9r8iknkrg05h4qh6l.apps.googleusercontent.com';

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.googleAuth({ credential: response.credential });
      if (res.data?.user) {
        setUser(res.data.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthModalOpen && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (e) {
        console.warn('Google Auth initialization warning:', e);
      }
    }
  }, [isAuthModalOpen]);

  const triggerGoogleSignIn = () => {
    setError(null);
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to Google OAuth Token Client popup if One-Tap is suppressed
            const tokenClient = (window as any).google?.accounts?.oauth2?.initTokenClient({
              client_id: googleClientId,
              scope: 'email profile openid',
              callback: async (tokenResponse: any) => {
                if (tokenResponse?.access_token) {
                  try {
                    setIsLoading(true);
                    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    });
                    const profile = await userInfoRes.json();
                    if (profile?.email) {
                      const res = await authService.googleAuth({
                        email: profile.email,
                        name: profile.name,
                        googleId: profile.sub,
                        avatarUrl: profile.picture,
                      });
                      if (res.data?.user) {
                        setUser(res.data.user);
                        closeAuthModal();
                      }
                    }
                  } catch (err: any) {
                    setError(err.message || 'Google authentication failed');
                  } finally {
                    setIsLoading(false);
                  }
                }
              },
            });
            tokenClient?.requestAccessToken();
          }
        });
      } catch (err: any) {
        setError(err.message || 'Unable to open Google sign-in window.');
      }
    } else {
      setError('Google Sign-In SDK is loading. Please check your internet connection.');
    }
  };

  React.useEffect(() => {
    setActiveTab(authModalTab === 'forgot' ? 'login' : authModalTab);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-cream-100/60 border-b border-cream-200">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-200/60 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-brand-800 text-white">
              <Sparkles size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Skincare Bangladesh
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-charcoal-900">
            {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeTab === 'login'
              ? 'Sign in to access your wishlist, track orders & save cart.'
              : 'Join to receive personalized routine advice & fast checkout.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex p-1 mt-4 bg-cream-200 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-gray-500 hover:text-charcoal-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-gray-500 hover:text-charcoal-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. user@example.com or 01712345678"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      closeAuthModal();
                      window.location.href = '/forgot-password';
                    }}
                    className="text-xs text-brand-800 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-800"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Google Social Auth */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-cream-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Or continue with</span>
                  <div className="flex-grow border-t border-cream-200"></div>
                </div>

                <button
                  type="button"
                  onClick={triggerGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-cream-50 text-charcoal-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
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

              {/* Google Social Auth */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-cream-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Or continue with</span>
                  <div className="flex-grow border-t border-cream-200"></div>
                </div>

                <button
                  type="button"
                  onClick={triggerGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-cream-50 text-charcoal-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign Up with Google</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
