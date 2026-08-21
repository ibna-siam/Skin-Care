import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-cream-200 shadow-xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">Forgot Password</h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter your registered email address and we'll generate a secure reset link.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-charcoal-900 text-base">Check Your Inbox</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              If an account with <span className="font-semibold text-charcoal-900">{email}</span> exists, we have generated your secure password recovery instructions.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-charcoal-900 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Storefront</span>
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-cream-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
            <Sparkles size={12} className="text-brand-600" />
            <span>256-bit Encrypted Password Recovery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
