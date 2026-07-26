'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Phone, Lock, User, Mail, Smartphone, Briefcase, Languages, ArrowRight } from 'lucide-react';

type Step = 'login' | 'register';

export default function AuthRootPage() {
  const router = useRouter();
  const { user, isReady, loginWithPhone, registerStaff } = useAuth();

  const [step, setStep] = useState<Step>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [reg, setReg] = useState({
    name: '',
    phone: '',
    password: '',
    devicePersonalNumber: '',
    email: '',
    expertise: '',
    languagesKnown: ''
  });

  useEffect(() => {
    if (isReady && user) {
      router.replace('/staff-portal');
    }
  }, [isReady, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Enter Tripeloo number and password');
      return;
    }

    setLoading(true);
    const result = await loginWithPhone(phone.trim(), password);
    setLoading(false);

    if (result.ok) {
      router.replace('/staff-portal');
      return;
    }

    if (result.code === 'NOT_FOUND') {
      setReg((prev) => ({ ...prev, phone: phone.trim(), password }));
      setStep('register');
      setError('');
      return;
    }

    setError(result.message || 'Login failed');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const required = [
      reg.name,
      reg.phone,
      reg.password,
      reg.devicePersonalNumber,
      reg.email,
      reg.expertise,
      reg.languagesKnown
    ];
    if (required.some((v) => !String(v).trim())) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await registerStaff({
      name: reg.name.trim(),
      phone: reg.phone.trim(),
      password: reg.password,
      devicePersonalNumber: reg.devicePersonalNumber.trim(),
      email: reg.email.trim(),
      expertise: reg.expertise.trim(),
      languagesKnown: reg.languagesKnown.trim()
    });
    setLoading(false);

    if (result.ok) {
      router.replace('/staff-portal');
      return;
    }

    setError(result.message || 'Registration failed');
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Opening staff portal…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-600/30">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Tripeloo CRM</h1>
          <p className="text-xs text-slate-400">
            {step === 'login' ? 'Sign in with phone & password' : 'New staff — complete your profile'}
          </p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Tripeloo Number
              </label>
              <input
                type="tel"
                autoFocus
                placeholder="Your Tripeloo work number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && <p className="text-[11px] text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-xl shadow-blue-600/25 transition"
            >
              <span>{loading ? 'Checking…' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              New here? Enter your Tripeloo number & password — we&apos;ll ask you to register if needed.
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              Phone not found. Create your staff profile to continue.
            </p>

            <Field
              icon={<User className="w-3.5 h-3.5 text-blue-400" />}
              label="Full Name"
              value={reg.name}
              onChange={(v) => setReg({ ...reg, name: v })}
              placeholder="Your full name"
            />
            <Field
              icon={<Phone className="w-3.5 h-3.5 text-emerald-400" />}
              label="Tripeloo Number"
              value={reg.phone}
              onChange={(v) => setReg({ ...reg, phone: v })}
              placeholder="Your Tripeloo work number"
              mono
            />
            <Field
              icon={<Smartphone className="w-3.5 h-3.5 text-violet-400" />}
              label="Personal Number"
              value={reg.devicePersonalNumber}
              onChange={(v) => setReg({ ...reg, devicePersonalNumber: v })}
              placeholder="Your personal number"
              mono
            />
            <Field
              icon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
              label="Email"
              type="email"
              value={reg.email}
              onChange={(v) => setReg({ ...reg, email: v })}
              placeholder="you@tripeloo.com"
            />
            <Field
              icon={<Briefcase className="w-3.5 h-3.5 text-cyan-400" />}
              label="Expertise"
              value={reg.expertise}
              onChange={(v) => setReg({ ...reg, expertise: v })}
              placeholder="e.g. Bali packages, Visa, Corporate"
            />
            <Field
              icon={<Languages className="w-3.5 h-3.5 text-amber-400" />}
              label="Languages Known"
              value={reg.languagesKnown}
              onChange={(v) => setReg({ ...reg, languagesKnown: v })}
              placeholder="e.g. English, Hindi, Tamil"
            />
            <Field
              icon={<Lock className="w-3.5 h-3.5 text-blue-400" />}
              label="Password"
              type="password"
              value={reg.password}
              onChange={(v) => setReg({ ...reg, password: v })}
              placeholder="Choose a password"
            />

            {error && <p className="text-[11px] text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-xl shadow-blue-600/25 transition"
            >
              <span>{loading ? 'Saving…' : 'Register & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('login');
                setError('');
              }}
              className="w-full text-[11px] text-slate-400 hover:text-white transition"
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  mono = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}
