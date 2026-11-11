import React, { useState } from 'react';
import {
  Siren,
  User,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  UserPlus,
  LogIn,
  Hospital as HospitalIcon,
  ShieldAlert
} from 'lucide-react';
import { UserRole, UserProfile, GraphNode } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import {
  PRE_REGISTERED_USERS,
  getAllRegisteredUsers,
  authenticateUser,
  registerUser,
  accountToProfile,
  RegisteredAccount
} from '../utils/authAccounts';

interface RoleSelectScreenProps {
  nodes: Record<string, GraphNode>;
  onSelectRoleAndLogin: (profile: UserProfile) => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  nodes,
  onSelectRoleAndLogin
}) => {
  const { isDark } = useTheme();
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Citizen open access fields (anyone can access)
  const [citizenName, setCitizenName] = useState('George Mathew');
  const [citizenPhone, setCitizenPhone] = useState('+91 98470 12345');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('cad.admin@kerala108.gov.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form fields
  const [regRole, setRegRole] = useState<UserRole>('hospital');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHospitalId, setRegHospitalId] = useState('medical_trust');
  const [regPhone, setRegPhone] = useState('');
  const [regCadPin, setRegCadPin] = useState('1080');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const hospitalList = Object.values(nodes).filter((n) => n.type === 'hospital');

  // Quick fill helper for pre-registered users
  const handleQuickFill = (user: RegisteredAccount) => {
    setAuthMode('login');
    setLoginEmail(user.email);
    setLoginPassword(user.password);
    setLoginError(null);
  };

  // Direct 1-Click Citizen Access (No authentication required)
  const handleCitizenInstantAccess = () => {
    onSelectRoleAndLogin({
      role: 'citizen',
      name: citizenName.trim() || 'Citizen Bystander',
      email: citizenPhone ? `citizen_${citizenPhone.replace(/\D/g, '').slice(-6)}@keralaems.org` : 'bystander@keralaems.org',
      badge: 'Citizen Bystander (Public Open Access)'
    });
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = authenticateUser(loginEmail, loginPassword);
    if (!result.success || !result.user) {
      setLoginError(result.error || 'Invalid credentials.');
      return;
    }

    const profile = accountToProfile(result.user);
    onSelectRoleAndLogin(profile);
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please provide a valid email address.');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Password must be at least 4 characters.');
      return;
    }

    if (regRole === 'admin' && regCadPin !== '1080' && regCadPin !== 'CAD108') {
      setRegError('Invalid CAD Officer Authorization PIN. Contact Ernakulam HQ (Default code: 1080).');
      return;
    }

    const hospNode = nodes[regHospitalId];
    const badge =
      regRole === 'admin'
        ? 'CAD Dispatch Officer (Kerala 108 Emergency CAD)'
        : regRole === 'hospital'
        ? `Medical Staff · ${hospNode ? hospNode.name.split(',')[0] : 'Hospital'}`
        : 'Registered Citizen Reporter';

    const result = registerUser({
      email: regEmail,
      password: regPassword,
      name: regName.trim(),
      role: regRole,
      badge,
      hospitalId: regRole === 'hospital' ? regHospitalId : undefined,
      phone: regPhone.trim() || undefined,
      departmentId: regRole === 'admin' ? `CAD-${Math.floor(100 + Math.random() * 900)}` : undefined
    });

    if (!result.success || !result.user) {
      setRegError(result.error || 'Registration failed.');
      return;
    }

    setRegSuccess(`Account created for ${result.user.name}! Logging you in...`);
    setTimeout(() => {
      onSelectRoleAndLogin(accountToProfile(result.user!));
    }, 700);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#060b16] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200`}>
      {/* Background ambient emergency glow */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-emerald-950/80 border-b border-slate-800/80 py-1.5 px-4 flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex-1 text-center truncate">
          <span className="text-red-400 font-bold uppercase tracking-wider mr-2">ResQPath:</span>
          <span className="text-slate-100 font-medium">Faster Routes. Smarter Response. Saving Lives.</span>
          <span className="hidden sm:inline text-slate-500 mx-2">·</span>
          <span className="hidden sm:inline text-emerald-400 font-mono text-[11px]">
            Ernakulam District CAD · Kerala 108 Emergency Medical Services
          </span>
        </div>
        <div className="shrink-0 ml-3">
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 my-auto">
        {/* Brand Lockup */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/40">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Official Kerala 108 CAD Network · Ernakulam
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 border border-red-400/40 flex items-center justify-center text-white shadow-xl shadow-red-950">
              <Siren className="w-7 h-7 animate-pulse" />
            </div>
            <span>ResQPath</span>
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-200">
            Intelligent Emergency Ambulance Routing and Dispatch System
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Welcome to the centralized dispatch network. Citizens can access public emergency reporting immediately without logging in. Hospital and CAD Admin staff can sign in or register below.
          </p>
        </div>

        {/* SECTION 1: CITIZEN OPEN ACCESS (ANYONE CAN ACCESS) */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0d1628] to-slate-900 border-2 border-rose-500/50 p-5 sm:p-6 shadow-2xl shadow-rose-950/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50 mt-1">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700 font-mono">
                    Public Citizen Access · Open to Anyone
                  </span>
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No Login or Password Required
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  Emergency Citizen Bystander Portal
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Are you a bystander reporting a road incident or tracking an active ambulance siren?
                  Citizens do not need to register. You can enter directly to report emergencies, follow live Kerala 108 GPS sirens, and view pre-arrival first-aid guidance.
                </p>
              </div>
            </div>

            {/* Quick entry controls for Citizen */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <div className="w-full sm:w-48">
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full px-3 py-2 rounded-xl bg-[#090f1e] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button
                onClick={handleCitizenInstantAccess}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-red-950 transition active:scale-95 whitespace-nowrap"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: AUTHENTICATION & REGISTRATION HUB (HOSPITAL & CAD ADMIN) */}
        <div className="max-w-2xl mx-auto w-full">
          {/* Registered Account Form (Login or Register) */}
          <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Tabs: Sign In vs Register */}
            <div className="flex border-b border-slate-800 bg-[#080d1a]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-3.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                  authMode === 'login'
                    ? 'border-cyan-500 text-cyan-400 bg-[#0e1628]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0c1322]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In (Registered Users)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setRegError(null);
                  setRegSuccess(null);
                }}
                className={`flex-1 py-3.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                  authMode === 'register'
                    ? 'border-emerald-500 text-emerald-400 bg-[#0e1628]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0c1322]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Account</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* TAB 1: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  {/* Quick-fill Pills for Pre-Registered Accounts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pre-Registered Users (Click to Quick-Fill):</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Password: password123</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRE_REGISTERED_USERS.map((usr) => {
                        const isSelected = loginEmail.toLowerCase() === usr.email.toLowerCase();
                        return (
                          <button
                            key={usr.id}
                            type="button"
                            onClick={() => handleQuickFill(usr)}
                            className={`p-2 rounded-xl border text-left transition flex items-center gap-2.5 ${
                              isSelected
                                ? usr.role === 'admin'
                                  ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500'
                                  : usr.role === 'hospital'
                                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                                  : 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500'
                                : 'bg-[#080d19] border-slate-800 hover:border-slate-700 hover:bg-[#0c1324]'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                usr.role === 'admin'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : usr.role === 'hospital'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {usr.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                              {usr.role === 'hospital' && <Building2 className="w-3.5 h-3.5" />}
                              {usr.role === 'citizen' && <User className="w-3.5 h-3.5" />}
                            </div>
                            <div className="overflow-hidden text-xs">
                              <p className="font-bold text-slate-100 truncate">{usr.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {usr.role === 'admin'
                                  ? 'CAD Admin Officer'
                                  : usr.role === 'hospital'
                                  ? usr.badge.split('·')[1]?.trim() || 'Hospital Staff'
                                  : 'Citizen'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Email / Username Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Email Address or Official Username:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. cad.admin@kerala108.gov.in"
                        required
                        className="w-full px-3 py-2.5 pl-9 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Password or CAD PIN:
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Demo PIN: password123 or 1080
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-3 py-2.5 pl-9 pr-10 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-950 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Authenticate &amp; Launch Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTRATION FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Select Role to Register:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('hospital')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          regRole === 'hospital'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                        <span className="text-xs">Hospital Staff</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('admin')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          regRole === 'admin'
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                        <span className="text-xs">CAD Admin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('citizen')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          regRole === 'citizen'
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                            : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <User className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                        <span className="text-xs">Citizen</span>
                      </button>
                    </div>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Full Name:</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={regRole === 'hospital' ? 'Dr. Sarah Varghese' : 'Officer Arun Pillai'}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Email Address:</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={regRole === 'hospital' ? 'sarah.v@medicaltrust.org' : 'arun.p@kerala108.gov.in'}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* If Hospital role, choose facility */}
                  {regRole === 'hospital' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300">
                        Select Ernakulam Hospital Facility:
                      </label>
                      <select
                        value={regHospitalId}
                        onChange={(e) => setRegHospitalId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                      >
                        {hospitalList.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} (ICU: {h.icuAvailable})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* If Admin role, enter authorization PIN */}
                  {regRole === 'admin' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-cyan-300">
                          CAD Authorization Code:
                        </label>
                        <span className="text-[10px] text-cyan-400 font-mono">Kerala EMS PIN: 1080</span>
                      </div>
                      <input
                        type="password"
                        value={regCadPin}
                        onChange={(e) => setRegCadPin(e.target.value)}
                        placeholder="Enter 1080"
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Password:</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Phone (Optional):</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 94470 ..."
                        className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Registered Account &amp; Log In</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t ${isDark ? 'border-slate-800/60 bg-[#050912] text-slate-500' : 'border-slate-200 bg-white text-slate-600'} py-4 text-xs px-6 transition-colors duration-200`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResQPath · Intelligent Emergency Ambulance Routing and Dispatch System</span>
          <span className={`font-mono text-[11px] ${isDark ? 'text-cyan-400' : 'text-sky-600 font-semibold'}`}>Kerala 108 EMS Network · Ernakulam Central CAD</span>
        </div>
      </div>
    </div>
  );
};
