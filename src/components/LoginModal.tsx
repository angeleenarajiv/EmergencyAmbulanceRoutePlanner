import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { GraphNode } from '../data/mockData';
import { UserRole, UserProfile } from '../types';
import {
  PRE_REGISTERED_USERS,
  getAllRegisteredUsers,
  authenticateUser,
  registerUser,
  accountToProfile,
  RegisteredAccount
} from '../utils/authAccounts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  nodes: Record<string, GraphNode>;
  onLoginSuccess: (profile: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  nodes,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [email, setEmail] = useState(currentUser.email || 'cad.admin@kerala108.gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register fields
  const [regRole, setRegRole] = useState<UserRole>('hospital');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHospitalId, setRegHospitalId] = useState(currentUser.hospitalId || 'medical_trust');
  const [regCadPin, setRegCadPin] = useState('1080');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const hospitalNodes = Object.values(nodes).filter((n) => n.type === 'hospital');

  const handleQuickFill = (usr: RegisteredAccount) => {
    setAuthMode('login');
    setEmail(usr.email);
    setPassword(usr.password);
    setErrorMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = authenticateUser(email, password);
    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Invalid credentials.');
      return;
    }

    onLoginSuccess(accountToProfile(result.user));
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (regRole === 'admin' && regCadPin !== '1080' && regCadPin !== 'CAD108') {
      setErrorMsg('Invalid CAD Authorization PIN (Default: 1080).');
      return;
    }

    const hospNode = nodes[regHospitalId];
    const badge =
      regRole === 'admin'
        ? 'CAD Dispatch Officer (Kerala 108 CAD)'
        : regRole === 'hospital'
        ? `Medical Staff · ${hospNode ? hospNode.name.split(',')[0] : 'Hospital'}`
        : 'Registered Citizen Bystander';

    const result = registerUser({
      email: regEmail,
      password: regPassword,
      name: regName.trim(),
      role: regRole,
      badge,
      hospitalId: regRole === 'hospital' ? regHospitalId : undefined
    });

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Registration failed.');
      return;
    }

    setRegSuccess(`Account created for ${result.user.name}!`);
    setTimeout(() => {
      onLoginSuccess(accountToProfile(result.user!));
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/70 via-[#0a1120] to-[#0a1120] border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Switch Operational Account
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select pre-registered credentials or register a new console user
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-[#090f1d] text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-4 font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              authMode === 'login'
                ? 'border-cyan-500 text-cyan-400 bg-[#0e1628]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (Pre-Registered)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-4 font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              authMode === 'register'
                ? 'border-emerald-500 text-emerald-400 bg-[#0e1628]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Quick-fill pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Pre-Registered Accounts (Click to Fill):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRE_REGISTERED_USERS.slice(0, 4).map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickFill(usr)}
                      className="p-1.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-slate-700 text-left text-[11px] truncate"
                    >
                      <span className="font-bold text-slate-200 block truncate">{usr.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate capitalize">
                        {usr.role === 'admin' ? 'CAD Admin' : usr.badge.split('·')[1]?.trim() || usr.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">Email or Username:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 pl-9 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Password:</label>
                  <span className="text-[10px] text-slate-400 font-mono">Default: password123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pl-9 pr-9 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Citizen open access shortcut */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess({
                      role: 'citizen',
                      name: 'Citizen Bystander',
                      email: 'citizen@keralaems.org',
                      badge: 'Citizen Bystander (Public Open Access)'
                    });
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Switch to Citizen Portal (Public Access - No Password)</span>
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-950 transition active:scale-95"
                >
                  <span>Authenticate &amp; Switch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Role */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Role to Register:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('hospital')}
                    className={`p-2 rounded-lg border text-center transition ${
                      regRole === 'hospital'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#070c18] border-slate-800 text-slate-400'
                    }`}
                  >
                    Hospital
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-2 rounded-lg border text-center transition ${
                      regRole === 'admin'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-[#070c18] border-slate-800 text-slate-400'
                    }`}
                  >
                    CAD Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`p-2 rounded-lg border text-center transition ${
                      regRole === 'citizen'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                        : 'bg-[#070c18] border-slate-800 text-slate-400'
                    }`}
                  >
                    Citizen
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Official Email Address"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Facility if hospital */}
              {regRole === 'hospital' && (
                <div className="space-y-1">
                  <label className="text-emerald-300 font-bold text-[11px]">Select Hospital:</label>
                  <select
                    value={regHospitalId}
                    onChange={(e) => setRegHospitalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-400"
                  >
                    {hospitalNodes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* CAD Pin if admin */}
              {regRole === 'admin' && (
                <div className="space-y-1">
                  <label className="text-cyan-300 font-bold text-[11px]">
                    CAD Auth Code (PIN: 1080):
                  </label>
                  <input
                    type="password"
                    value={regCadPin}
                    onChange={(e) => setRegCadPin(e.target.value)}
                    placeholder="Enter 1080"
                    className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create Password (min 4 chars)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950 transition active:scale-95"
                >
                  Register &amp; Switch
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
