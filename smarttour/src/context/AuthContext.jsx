import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../data/mockData';
import { MOCK_USERS } from '../data/extraData';

const AuthContext = createContext(null);

const DEFAULT_ACCOUNTS = [
  {
    id: 'user-demo-01',
    name: 'Arjun Mehta',
    username: '@arjun_mehta',
    role: 'tourist',
    email: 'arjun.mehta@gmail.com',
    avatar: 'AM',
    location: 'Chennai, Tamil Nadu',
    bio: 'Photographer & solo explorer traversing the temples and hills of TN.',
    interests: ['photography', 'nature', 'culture'],
    badge: '📸 Top Vlogger',
  },
  {
    id: 'user-streak-demo',
    name: 'Demo Streaker',
    username: '@demo_streaker',
    role: 'tourist',
    email: 'demo.streak@example.com',
    avatar: '🔥',
    location: 'Chennai, Tamil Nadu',
    bio: 'I log in every day to get rewards!',
    interests: ['food', 'travel'],
    badge: '🏆 Elite Explorer',
  },
  {
    id: 'user-t02',
    name: 'Priya Sharma',
    username: '@priya_sharma',
    role: 'tourist',
    email: 'priya.sharma@outlook.com',
    avatar: 'PS',
    location: 'Coimbatore, Tamil Nadu',
    bio: 'Architecture lover & temple architecture researcher.',
    interests: ['culture', 'history', 'food'],
    badge: '🏛️ Heritage Guide',
  },
  {
    id: 'user-t03',
    name: 'Karthik Rajan',
    username: '@karthik_rajan',
    role: 'tourist',
    email: 'karthik.rajan@gmail.com',
    avatar: 'KR',
    location: 'Madurai, Tamil Nadu',
    bio: 'Trekker, roadtripper, always up for a spontaneous Stranger Trip!',
    interests: ['adventure', 'trekking', 'photography'],
    badge: '🎒 Squad Leader',
  },
  {
    id: 'user-t04',
    name: 'Divya Nair',
    username: '@divya_nair',
    role: 'tourist',
    email: 'divya.nair@yahoo.com',
    avatar: 'DN',
    location: 'Trichy, Tamil Nadu',
    bio: 'Backpacker & wildlife lover chasing sunrises and hidden waterfalls.',
    interests: ['adventure', 'nature', 'wildlife'],
    badge: '🌿 Eco Warrior',
  },
  {
    id: 'user-t05',
    name: 'Rahul Subramanian',
    username: '@rahul_subbu',
    role: 'tourist',
    email: 'rahul.subbu@gmail.com',
    avatar: 'RS',
    location: 'Salem, Tamil Nadu',
    bio: 'Foodie chasing authentic traditional recipes.',
    interests: ['food', 'culture'],
    badge: '🍜 Food Explorer',
  },
  {
    id: 'user-t06',
    name: 'Meena Krishnan',
    username: '@meena_k',
    role: 'tourist',
    email: 'meena.k@gmail.com',
    avatar: 'MK',
    location: 'Tirunelveli, Tamil Nadu',
    bio: 'Nature wanderer and wildlife photographer.',
    interests: ['wildlife', 'nature'],
    badge: '🐾 Wildlife Pro',
  },
  {
    id: 'user-t07',
    name: 'Surya Prakash',
    username: '@surya_prakash',
    role: 'tourist',
    email: 'surya.p@gmail.com',
    avatar: 'SP',
    location: 'Thanjavur, Tamil Nadu',
    bio: 'Chola heritage explorer and history writer.',
    interests: ['heritage', 'photography'],
    badge: '📜 Historian',
  },
  {
    id: 'user-t08',
    name: 'Anitha Devi',
    username: '@anitha_devi',
    role: 'tourist',
    email: 'anitha.devi@gmail.com',
    avatar: 'AD',
    location: 'Ooty, Tamil Nadu',
    bio: 'Hill trekker and tea planter.',
    interests: ['nature', 'adventure'],
    badge: '🏔️ Mountain Guide',
  },
  {
    id: 'biz-demo-01',
    name: 'Rajan Krishnamurthy',
    username: '@rajan_heritage_walks',
    role: 'business',
    email: 'rajan@heritagewalk.in',
    avatar: 'RK',
    businessName: 'Rajan Heritage Walking Tours',
    location: 'Chennai, Tamil Nadu',
    bio: 'Certified TN heritage guide with 14+ years exploring historical monuments.',
    interests: ['heritage', 'history'],
    badge: '⭐ 4.9 Verified Host',
  },
  {
    id: 'biz-u01',
    name: 'Rajan Heritage Walks',
    username: '@rajan_walks',
    role: 'business',
    email: 'contact@rajanwalks.com',
    avatar: 'RH',
    businessName: 'Rajan Heritage Walks',
    location: 'Chennai, Tamil Nadu',
    bio: 'Daily guided architectural and history walks.',
    interests: ['heritage', 'history'],
    badge: '⭐ 4.9 Verified Host',
  },
  {
    id: 'biz-u02',
    name: 'Nilgiri Organic Farm Stay',
    username: '@nilgiri_farm_stay',
    role: 'business',
    email: 'stay@nilgirifarm.com',
    avatar: 'NO',
    businessName: 'Nilgiri Organic Farm Stay',
    location: 'Ooty, Tamil Nadu',
    bio: 'Eco-resort and tea plantation experience in the heart of the Nilgiris.',
    interests: ['nature', 'food', 'hospitality'],
    badge: '🌿 Eco Certified',
  },
  {
    id: 'biz-u03',
    name: 'Meenakshi Food Court',
    username: '@meenakshi_food_court',
    role: 'business',
    email: 'contact@meenakshifood.in',
    avatar: 'MF',
    businessName: 'Meenakshi Traditional Food Court',
    location: 'Madurai, Tamil Nadu',
    bio: 'Authentic 50-year-old culinary house serving Madurai delicacies.',
    interests: ['food', 'culture'],
    badge: '⭐ Top Rated Food',
  },
  {
    id: 'biz-u04',
    name: 'Kodai Adventure Tours',
    username: '@kodai_adventure_tours',
    role: 'business',
    email: 'info@kodaiadventure.com',
    avatar: 'KA',
    businessName: 'Kodai Adventure Tours',
    location: 'Kodaikanal, Tamil Nadu',
    bio: 'Pine forest trekking, camping, waterfall rappel.',
    interests: ['adventure', 'nature'],
    badge: '🧗 Adventure Partner',
  },
  {
    id: 'biz-u05',
    name: 'Chettinad Heritage Stay',
    username: '@chettinad_heritage_stay',
    role: 'business',
    email: 'reservations@chettinadstay.com',
    avatar: 'CH',
    businessName: 'Chettinad Heritage Stay & Mansions',
    location: 'Karaikudi, Tamil Nadu',
    bio: 'Stay in a 110-year-old Chettinad palace with authentic royal banquets.',
    interests: ['culture', 'food', 'heritage'],
    badge: '🏰 Heritage Palace',
  },
  {
    id: 'admin-01',
    name: 'Commissioner Sundar',
    username: '@admin_sundar',
    role: 'admin',
    email: 'commissioner@smarttour.gov.in',
    avatar: 'CS',
    location: 'Tamil Nadu Tourism Dept',
    bio: 'Tamil Nadu Tourism & Crowd Safety Admin.',
    interests: ['administration', 'analytics'],
    badge: '🏛️ Municipality Admin',
  },
  {
    id: 'resp-01',
    name: 'Officer Kavitha',
    username: '@officer_kavitha',
    role: 'responder',
    email: 'kavitha@rescue.gov.in',
    avatar: 'OK',
    location: 'TN Coastal & Hill Rescue Squad',
    bio: 'Rapid SOS responder and tourist safety officer.',
    interests: ['safety', 'first-aid'],
    badge: '🚨 Quick Responder',
  },
];

function loadStored(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadStored('st_accounts', DEFAULT_ACCOUNTS));
  const [user, setUser] = useState(() => loadStored('st_current_user', null));
  const [role, setRole] = useState(() => loadStored('st_current_role', null));
  const [pendingRequests, setPendingRequests] = useState(() => loadStored('st_pending_requests', []));
  const [loginHistory, setLoginHistory] = useState(() => loadStored('st_login_history', []));

  useEffect(() => {
    saveStored('st_accounts', accounts);
  }, [accounts]);

  useEffect(() => {
    saveStored('st_current_user', user);
    saveStored('st_current_role', role);
  }, [user, role]);

  useEffect(() => {
    saveStored('st_pending_requests', pendingRequests);
  }, [pendingRequests]);

  useEffect(() => {
    saveStored('st_login_history', loginHistory);
  }, [loginHistory]);

  function loginAsAccount(acc) {
    setUser(acc);
    setRole(acc.role);
    // Track login in history
    setLoginHistory(prev => {
      const entry = {
        id: acc.id,
        name: acc.name,
        username: acc.username,
        avatar: acc.avatar,
        role: acc.role,
        location: acc.location,
        email: acc.email,
        badge: acc.badge,
        lastLoginAt: new Date().toISOString(),
      };
      const filtered = prev.filter(h => h.id !== acc.id);
      return [entry, ...filtered];
    });
    return acc;
  }

  function login(selectedRole) {
    const matched = accounts.find(a => a.role === selectedRole) || {
      id: `user-${selectedRole}-${Date.now()}`,
      name: `${selectedRole.toUpperCase()} User`,
      role: selectedRole,
      email: `${selectedRole}@smarttour.in`,
      avatar: selectedRole.slice(0, 2).toUpperCase(),
      location: 'Chennai, Tamil Nadu',
      interests: ['travel', 'tamilnadu'],
    };
    loginAsAccount(matched);
  }

  function registerUser({ name, email, role, avatar, location, bio, interests }) {
    const initials = (name || 'TU')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const cleanHandle = '@' + name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const newAcc = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      username: cleanHandle,
      email: (email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`).trim(),
      role: role || 'tourist',
      avatar: avatar || initials,
      location: location || 'Tamil Nadu, India',
      bio: bio || 'Traveler exploring the beauty of Tamil Nadu.',
      interests: interests || ['photography', 'culture'],
      badge: role === 'business' ? '🏪 Business Partner'
           : role === 'admin' ? '🏛️ Municipality Admin'
           : role === 'responder' ? '🚨 Quick Responder'
           : '🌱 New Explorer',
    };

    // Admin and Responder roles require admin approval
    if (role === 'admin' || role === 'responder') {
      const pendingReq = {
        ...newAcc,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
      };
      setPendingRequests(prev => [pendingReq, ...prev]);
      return { pending: true, request: pendingReq };
    }

    // Tourist and Business roles get instant access
    setAccounts(prev => [newAcc, ...prev.filter(a => a.id !== newAcc.id)]);
    loginAsAccount(newAcc);
    return newAcc;
  }

  function approveRequest(requestId) {
    const req = pendingRequests.find(r => r.id === requestId);
    if (!req) return null;

    // Build clean account object (without pending metadata)
    const approvedAcc = {
      id: req.id,
      name: req.name,
      username: req.username,
      email: req.email,
      role: req.role,
      avatar: req.avatar,
      location: req.location,
      bio: req.bio,
      interests: req.interests,
      badge: req.badge,
    };

    // Move from pending to accounts
    setAccounts(prev => [approvedAcc, ...prev.filter(a => a.id !== approvedAcc.id)]);
    setPendingRequests(prev =>
      prev.map(r => r.id === requestId
        ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.name || 'Admin' }
        : r
      )
    );
    return approvedAcc;
  }

  function rejectRequest(requestId) {
    setPendingRequests(prev =>
      prev.map(r => r.id === requestId
        ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: user?.name || 'Admin' }
        : r
      )
    );
  }

  function logout() {
    setUser(null);
    setRole(null);
    localStorage.removeItem('st_current_user');
    localStorage.removeItem('st_current_role');
  }

  function deleteAccount(accountId) {
    if (!accountId) return;
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    if (user?.id === accountId) {
      logout();
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      role,
      accounts,
      pendingRequests,
      loginHistory,
      login,
      loginAsAccount,
      registerUser,
      approveRequest,
      rejectRequest,
      logout,
      deleteAccount,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

