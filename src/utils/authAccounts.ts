import { UserProfile, UserRole } from '../types';

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string; // Plaintext or hash for client-side demo auth
  role: UserRole;
  name: string;
  badge: string;
  hospitalId?: string;
  phone?: string;
  departmentId?: string;
  isPreRegistered?: boolean;
}

// Default pre-registered users for Hospital, Admin, and Citizen
export const PRE_REGISTERED_USERS: RegisteredAccount[] = [
  // 1. ADMIN USERS
  {
    id: 'usr_admin_01',
    email: 'cad.admin@kerala108.gov.in',
    password: 'password123',
    role: 'admin',
    name: 'Officer Sarah Chen',
    badge: 'Chief EMS Dispatcher (Kerala 108 CAD Ernakulam HQ)',
    phone: '+91 94470 10801',
    departmentId: 'CAD-EKM-HQ-01',
    isPreRegistered: true
  },
  {
    id: 'usr_admin_02',
    email: 'dispatch.control@kerala108.gov.in',
    password: 'password123',
    role: 'admin',
    name: 'Commander Rajesh Kumar',
    badge: 'Senior CAD Routing Controller (Central Control Room)',
    phone: '+91 94470 10802',
    departmentId: 'CAD-EKM-ROUTER-02',
    isPreRegistered: true
  },

  // 2. HOSPITAL USERS (Linked to specific Ernakulam hospital facilities)
  {
    id: 'usr_hosp_01',
    email: 'medicaltrust@keralaems.org',
    password: 'password123',
    role: 'hospital',
    name: 'Dr. Mathew Kurian',
    badge: 'Trauma Director · Medical Trust Hospital',
    hospitalId: 'medical_trust',
    phone: '+91 484 235-8001',
    departmentId: 'MTH-EMERGENCY-DIR',
    isPreRegistered: true
  },
  {
    id: 'usr_hosp_02',
    email: 'astermedcity@keralaems.org',
    password: 'password123',
    role: 'hospital',
    name: 'Dr. Ananya Nair',
    badge: 'Emergency Bay Head · Aster Medcity Trauma Center',
    hospitalId: 'aster_medcity',
    phone: '+91 484 669-9999',
    departmentId: 'AMC-TRAUMA-HEAD',
    isPreRegistered: true
  },
  {
    id: 'usr_hosp_03',
    email: 'lakeshore@keralaems.org',
    password: 'password123',
    role: 'hospital',
    name: 'Dr. Thomas Varghese',
    badge: 'Lead Trauma Surgeon · VPS Lakeshore Hospital',
    hospitalId: 'lakeshore',
    phone: '+91 484 270-1032',
    departmentId: 'VPS-TRAUMA-SURG',
    isPreRegistered: true
  },
  {
    id: 'usr_hosp_04',
    email: 'generalhospital@keralaems.org',
    password: 'password123',
    role: 'hospital',
    name: 'Dr. Priya Menon',
    badge: 'Duty Medical Officer · Ernakulam General Hospital',
    hospitalId: 'general_hospital',
    phone: '+91 484 236-1251',
    departmentId: 'GH-CASUALTY-DMO',
    isPreRegistered: true
  },

  // 3. CITIZEN USERS (Optional pre-registered citizens)
  {
    id: 'usr_citizen_01',
    email: 'george.mathew@keralaems.org',
    password: 'password123',
    role: 'citizen',
    name: 'George Mathew',
    badge: 'Citizen Bystander (Ernakulam Central)',
    phone: '+91 98470 12345',
    isPreRegistered: true
  }
];

const STORAGE_KEY = 'resqpath_registered_users_v1';

// Load stored users combined with pre-registered users
export function getAllRegisteredUsers(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: RegisteredAccount[] = JSON.parse(raw);
      // Merge, giving precedence to stored if matching id, or append new
      const mergedMap = new Map<string, RegisteredAccount>();
      PRE_REGISTERED_USERS.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
      stored.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.warn('Error reading stored registered users:', err);
  }
  return [...PRE_REGISTERED_USERS];
}

// Authenticate user by email/username and password
export function authenticateUser(
  emailOrUsername: string,
  pass: string
): { success: boolean; user?: RegisteredAccount; error?: string } {
  const users = getAllRegisteredUsers();
  const cleanInput = emailOrUsername.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanInput ||
      u.email.split('@')[0].toLowerCase() === cleanInput
  );

  if (!found) {
    return {
      success: false,
      error: `No registered account found with username/email "${emailOrUsername}". For Hospital or Admin, use a pre-registered account or create a new registration.`
    };
  }

  // Allow 'password123' or '1080' for pre-registered convenience
  const isValidPass =
    found.password === pass ||
    (found.isPreRegistered && (pass === '1080' || pass === 'password123' || pass === 'admin' || pass === 'hospital'));

  if (!isValidPass) {
    return {
      success: false,
      error: 'Invalid password. (For pre-registered demo accounts, default is password123 or 1080)'
    };
  }

  return {
    success: true,
    user: found
  };
}

// Register a new user
export function registerUser(newUser: Omit<RegisteredAccount, 'id'>): {
  success: boolean;
  user?: RegisteredAccount;
  error?: string;
} {
  const users = getAllRegisteredUsers();
  const cleanEmail = newUser.email.trim().toLowerCase();

  if (!cleanEmail || !newUser.password || !newUser.name) {
    return { success: false, error: 'Full name, email, and password are required.' };
  }

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: `An account with email ${cleanEmail} already exists. Please log in.` };
  }

  const account: RegisteredAccount = {
    ...newUser,
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    email: cleanEmail,
    isPreRegistered: false
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existingList: RegisteredAccount[] = raw ? JSON.parse(raw) : [];
    existingList.push(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));
  } catch (err) {
    console.warn('Error saving new registered user to localStorage:', err);
  }

  return {
    success: true,
    user: account
  };
}

// Convert RegisteredAccount to UserProfile for session
export function accountToProfile(acc: RegisteredAccount): UserProfile {
  return {
    role: acc.role,
    name: acc.name,
    email: acc.email,
    badge: acc.badge,
    hospitalId: acc.hospitalId
  };
}
