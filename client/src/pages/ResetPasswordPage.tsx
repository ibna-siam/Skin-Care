import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.resetPassword({ token, newPassword });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-cream-200 shadow-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">Set New Password</h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose a strong security password for your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-charcoal-900 text-base">Password Reset Complete!</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your password has been successfully updated. You can now log into your account with your new credentials.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <span>Return to Storefront</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                New Password (min. 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl pl-10 pr-11 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-800 hover:bg-brand-900 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ResetPasswordPage;
