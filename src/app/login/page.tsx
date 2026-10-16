'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { loginAction, signupAction } from './actions';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [stateError, setStateError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Map URL errors to helpful user messages
  const getUrlErrorMessage = () => {
    if (urlError === 'session_expired') {
      return 'Your authentication session has expired. Please sign in again to continue.';
    }
    if (urlError === 'invalid_session') {
      return 'Invalid session detected. Please sign in with your credentials.';
    }
    if (urlError === 'unauthorized_organizer') {
      return 'Access restricted: Organizer and Warden console requires verified elevated permissions. Resident students cannot access organizer functions.';
    }
    return null;
  };

  const displayError = stateError || getUrlErrorMessage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStateError(null);
    setVerificationNotice(null);

    const formData = new FormData(e.currentTarget);
    formData.set('email', email.trim());
    formData.set('password', password);
    formData.set('redirectTo', redirectTo);

    startTransition(async () => {
      try {
        if (mode === 'login') {
          const result = await loginAction(null, formData);
          if (result && !result.success && result.error) {
            setStateError(result.error);
          }
        } else {
          const result = await signupAction(null, formData);
          if (result && !result.success && result.error) {
            setStateError(result.error);
          } else if (result?.requiresVerification) {
            setVerificationNotice(
              result.email || email || 'your email address'
            );
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
          setStateError(err.message);
        }
      }
    });
  };

  // Demo fill helper to simplify local testing
  const handleDemoFill = (type: 'student' | 'new_user') => {
    setStateError(null);
    if (type === 'student') {
      setMode('login');
      setEmail('student.demo@study.iitm.ac.in');
      setPassword('HouseOS2026!');
    } else {
      setMode('signup');
      setDisplayName('Aarav Sharma');
      setEmail(`student_${Date.now().toString().slice(-4)}@study.iitm.ac.in`);
      setPassword('HouseOS2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#101116] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-[#F3F0E8]">
      {/* Background ambient festival lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-[#8B7CFF]/15 via-[#43E5D2]/10 to-[#8B7CFF]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#43E5D2]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Center Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 p-1.5 rounded-xl group focus:outline-none focus:ring-2 focus:ring-[#43E5D2]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#202631] border border-[#343A49] flex items-center justify-center text-white shadow-xs group-hover:border-[#43E5D2] transition-colors">
              <Building2 className="w-5 h-5 text-[#43E5D2]" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
              HouseOS
              <span className="text-[10px] font-mono tracking-widest text-[#43E5D2] uppercase px-1.5 py-0.5 rounded bg-[#43E5D2]/10 border border-[#43E5D2]/25">
                v2.6
              </span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">
            IIT Madras BS Community Portal
          </h1>
          <p className="text-xs text-[#A0A6B8] max-w-sm mx-auto">
            {mode === 'login'
              ? 'Sign in to access your house cosmos, PARADOX & SAAVAN passes, and activity scores.'
              : 'Create a student profile to join your residential house and register for campus flagships.'}
          </p>
        </div>

        {/* Verification Success Screen */}
        {verificationNotice ? (
          <div className="p-6 sm:p-8 bg-[#202631] border border-[#43E5D2]/40 rounded-2xl shadow-2xl space-y-5 text-center animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#43E5D2]/15 border border-[#43E5D2]/40 flex items-center justify-center text-[#43E5D2]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Verification Email Sent</h2>
              <p className="text-xs text-[#A0A6B8] leading-relaxed">
                We sent a secure activation link to:
              </p>
              <p className="text-xs font-mono font-bold text-[#43E5D2] bg-[#101116] py-1.5 px-3 rounded-lg border border-[#343A49] inline-block">
                {verificationNotice}
              </p>
              <p className="text-xs text-[#A0A6B8] leading-relaxed pt-2">
                Please check your inbox (and spam folder) and click the link to verify your email. Once verified, you can sign in with your credentials.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setVerificationNotice(null);
                setMode('login');
              }}
              className="bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold shadow-xs border-none"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          /* Auth Card */
          <div className="p-6 sm:p-8 bg-[#202631] border border-[#343A49] rounded-2xl shadow-2xl space-y-5">
            {/* Mode selector tab */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#101116] border border-[#343A49] text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStateError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#43E5D2] text-[#101116] font-bold shadow-xs'
                    : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStateError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#43E5D2] text-[#101116] font-bold shadow-xs'
                    : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {displayError && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-xl bg-[#FF896D]/10 border border-[#FF896D]/30 flex items-start gap-2.5 text-xs text-[#FF896D]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-snug">{displayError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="signup-displayname"
                      className="block text-xs font-semibold text-[#F3F0E8] mb-1"
                    >
                      Full Name / Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A6B8]" />
                      <input
                        id="signup-displayname"
                        name="displayName"
                        type="text"
                        autoComplete="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={mode === 'signup'}
                        disabled={isPending}
                        placeholder="e.g. Anand Sharma"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#F3F0E8] placeholder-[#6C7280] focus:outline-none focus:border-[#43E5D2] focus:ring-1 focus:ring-[#43E5D2] disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-semibold text-[#F3F0E8] mb-1"
                  >
                    Student / Institute Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A6B8]" />
                    <input
                      id="auth-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isPending}
                      placeholder="e.g. 22f300142@ds.study.iitm.ac.in"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#F3F0E8] placeholder-[#6C7280] focus:outline-none focus:border-[#43E5D2] focus:ring-1 focus:ring-[#43E5D2] disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-[#F3F0E8]"
                    >
                      Password
                    </label>
                    {mode === 'signup' && (
                      <span className="text-[10px] text-[#A0A6B8] font-mono">
                        Min. 6 chars
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A6B8]" />
                    <input
                      id="auth-password"
                      name="password"
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isPending}
                      placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#F3F0E8] placeholder-[#6C7280] focus:outline-none focus:border-[#43E5D2] focus:ring-1 focus:ring-[#43E5D2] disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Critical role security notice */}
              {mode === 'signup' && (
                <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] flex items-start gap-2.5 text-[11px] text-[#A0A6B8]">
                  <ShieldCheck className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
                  <p>
                    New public accounts are securely provisioned with the <span className="text-[#43E5D2] font-semibold">Resident Student</span> role. Council and Faculty Warden credentials require campus administration approval.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isPending}
                className="mt-2 bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold shadow-xs border-none"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{mode === 'login' ? 'Sign In to HouseOS' : 'Create Student Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Fill Options */}
            <div className="pt-2 border-t border-[#343A49]/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B8]">
                <span>Testing Helpers</span>
                <span className="text-[10px] text-[#43E5D2] flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Quick Prefill
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('student')}
                  className="p-2.5 rounded-lg bg-[#101116] hover:bg-[#28303E] border border-[#343A49] text-left transition-colors cursor-pointer group"
                >
                  <p className="font-semibold text-white group-hover:text-[#43E5D2]">Sample Student</p>
                  <p className="text-[10px] text-[#A0A6B8]">Sign In preset</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('new_user')}
                  className="p-2.5 rounded-lg bg-[#101116] hover:bg-[#28303E] border border-[#343A49] text-left transition-colors cursor-pointer group"
                >
                  <p className="font-semibold text-white group-hover:text-[#43E5D2]">New Registration</p>
                  <p className="text-[10px] text-[#A0A6B8]">Sign Up preset</p>
                </button>
              </div>
            </div>

            {/* Supabase Auth information notice */}
            <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] flex items-start gap-2.5 text-[11px] text-[#A0A6B8]">
              <KeyRound className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0 mt-0.5" />
              <p>
                Connected to Supabase Auth. Sessions are secured via HTTP-only cookies and cryptographic signatures.
              </p>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#A0A6B8] hover:text-[#43E5D2] transition-colors"
          >
            ← Return to Community Universe
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#A0A6B8] py-4">
        HouseOS • Built for IIT Madras BS Community • 12 Official Houses
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101116] flex items-center justify-center text-[#A0A6B8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#43E5D2]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
