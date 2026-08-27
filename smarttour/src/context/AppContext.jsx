import { createContext, useContext, useState, useEffect } from 'react';
import {
  DESTINATIONS, BUSINESSES, EMERGENCY_REQUESTS, BOOKINGS, REPORTS, SAFETY_ALERTS
} from '../data/mockData';
import {
  TN_EXTRA_DESTINATIONS, COMMUNITY_POSTS, MOCK_USERS, STRANGER_TRIPS
} from '../data/extraData';
import { SEED_STORIES } from '../data/storyData';
import { DEFAULT_MINDSET_DATASET } from '../data/mindsetDataset';
import { sendOpinionToServer, reactToOpinionOnServer, respondToOpinionOnServer, uploadDatasetToServer } from '../services/apiService';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const ALL_DESTINATIONS = [
  ...DESTINATIONS.filter(d => d.state === 'Tamil Nadu'),
  ...TN_EXTRA_DESTINATIONS,
];

const BAD_WORDS = ['vulnerable', 'abuse', 'scam', 'spam', 'fake', 'hate', 'harass', 'kill'];
function containsBadWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BAD_WORDS.some(w => lower.includes(w));
}

const INITIAL_OPINIONS = [
  {
    id: 'op-init-1',
    businessId: 'biz-u01',
    businessName: 'Rajan Heritage Walks',
    touristId: 'user-demo-01',
    touristName: 'Arjun Mehta',
    rating: 5,
    comment: 'The early morning heritage walk inside Mylapore and temple corridors was breathtaking! The storytelling was so immersive.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reactions: [{ emoji: '❤️', from: 'biz-u01' }, { emoji: '🙏', from: 'biz-u01' }],
    responses: [
      {
        id: 'resp-1',
        responderId: 'biz-u01',
        responderName: 'Rajan Heritage Walks',
        text: 'Thank you so much Arjun! Delighted that you enjoyed the cultural lore. Looking forward to hosting you on our Thanjavur art trail next!',
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  {
    id: 'op-init-2',
    businessId: 'biz-demo-01',
    businessName: 'Rajan Heritage Walks',
    touristId: 'user-t02',
    touristName: 'Priya Sharma',
    rating: 5,
    comment: 'Exceptional attention to history, safe group navigation, and fantastic local tea breaks.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    reactions: [{ emoji: '👍', from: 'biz-demo-01' }],
    responses: []
  }
];

export function AppProvider({ children }) {
  const { user: authUser } = useAuth();
  
  const [destinations] = useState(ALL_DESTINATIONS);
  const [businesses] = useState(BUSINESSES);
  const [emergencyRequests, setEmergencyRequests] = useState(EMERGENCY_REQUESTS);
  const [bookings, setBookings] = useState(BOOKINGS);
  const [reports, setReports] = useState(REPORTS);
  const [alerts] = useState(SAFETY_ALERTS);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [sosActive, setSosActive] = useState(false);

  // ── Mindset Dataset (User Uploadable & Retrainable) ───────────
  const [mindsetDataset, setMindsetDataset] = useState(() => load('st_mindset_dataset', DEFAULT_MINDSET_DATASET));
  const [modelTrainedAt, setModelTrainedAt] = useState(() => load('st_model_trained', new Date().toISOString()));

  // ── Community Posts & Stories ─────────────────────────────────
  const [posts, setPosts] = useState(() => load('st_posts', COMMUNITY_POSTS));
  const [stories, setStories] = useState(() => load('st_stories', SEED_STORIES));
  const [simulatedActiveUserId, setSimulatedActiveUserId] = useState(() => load('st_sim_user', 'user-demo-01'));
  
  const defaultStreakData = {
    currentStreak: 0, longestStreak: 0, lastLoginDate: null,
    xp: 0, badges: [], rewards: [], loginHistory: [],
    totalPosts: 0, totalOpinions: 0, totalChats: 0, totalStrangerTrips: 0,
  };

  const initialStreakDemo = {
    currentStreak: 32,
    longestStreak: 32,
    lastLoginDate: new Date().toDateString(),
    xp: 4500,
    badges: ['seedling', '7day_flame', '30day_gold', 'explorer'],
    rewards: [
      {
        id: `rwd-biz-demo-123`,
        type: 'business_gift',
        icon: '🎁',
        title: 'Free Table Booking',
        description: `Gifted by Rajan Heritage Walks: 30-day streak special!`,
        validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
        claimed: false,
        earnedAt: new Date().toISOString(),
        issuedBy: 'Rajan Heritage Walks',
        businessId: 'biz-demo-01',
        touristId: 'user-streak-demo',
        secretCode: 'DEMO99'
      }
    ],
    loginHistory: [],
    totalPosts: 5, totalOpinions: 2, totalChats: 1, totalStrangerTrips: 0,
  };

  const [streakDataMap, setStreakDataMap] = useState(() => {
    const saved = load('st_streak_map', {});
    // Force inject the demo account if it doesn't exist in local storage yet
    if (!saved['user-streak-demo']) {
      saved['user-streak-demo'] = initialStreakDemo;
    }
    return saved;
  });

  // Use real auth user id, fallback to demo 
  const activeUserId = authUser?.id || 'user-demo-01';
  const streakData = streakDataMap[activeUserId] || defaultStreakData;

  function setStreakData(updater) {
    setStreakDataMap(prev => {
      const current = prev[activeUserId] || defaultStreakData;
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [activeUserId]: updated };
    });
  }

  const [conversations, setConversations] = useState(() => load('st_convs', []));
  const [messages, setMessages] = useState(() => load('st_msgs', {}));
  const [opinions, setOpinions] = useState(() => load('st_opinions', INITIAL_OPINIONS));
  const [users, setUsers] = useState(() => load('st_users', MOCK_USERS));

  // ── Stranger Trips ────────────────────────────────────────────
  const [strangerTrips, setStrangerTrips] = useState(() => load('st_stranger_trips', STRANGER_TRIPS));

  // ── Persist ───────────────────────────────────────────────────
  useEffect(() => save('st_mindset_dataset', mindsetDataset), [mindsetDataset]);
  useEffect(() => save('st_model_trained', modelTrainedAt), [modelTrainedAt]);
  useEffect(() => save('st_posts', posts), [posts]);
  useEffect(() => save('st_stories', stories), [stories]);
  useEffect(() => save('st_streak_map', streakDataMap), [streakDataMap]);
  useEffect(() => save('st_convs', conversations), [conversations]);
  useEffect(() => save('st_msgs', messages), [messages]);
  useEffect(() => save('st_opinions', opinions), [opinions]);
  useEffect(() => save('st_users', users), [users]);
  useEffect(() => save('st_sim_user', simulatedActiveUserId), [simulatedActiveUserId]);
  useEffect(() => save('st_stranger_trips', strangerTrips), [strangerTrips]);

  // ── Stories Operations ────────────────────────────────────────
  function addStory(storyData) {
    if (containsBadWords(storyData.caption) || containsBadWords(storyData.song)) {
      alert("Content blocked by auto-moderation safety filters.");
      return null;
    }
    const newStory = {
      id: `story-${Date.now()}`,
      timestamp: new Date().toISOString(),
      views: [],
      likes: [],
      ...storyData,
    };
    setStories(prev => [newStory, ...prev.filter(s => s.userId !== newStory.userId)]);
    awardXP(15, 'storyteller');
    return newStory;
  }

  function deleteStory(storyId) {
    setStories(prev => prev.filter(s => s.id !== storyId));
  }

  function viewStory(storyId, viewerId) {
    if (!viewerId) return;
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const curViews = s.views || [];
      if (curViews.includes(viewerId)) return s;
      return { ...s, views: [...curViews, viewerId] };
    }));
  }

  function reactToStory(storyId, reaction, senderUser) {
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const curLikes = s.likes || [];
      const isAlready = curLikes.includes(senderUser?.id);
      return {
        ...s,
        likes: isAlready ? curLikes : [...curLikes, senderUser?.id]
      };
    }));
  }

  // ── Posts & Real Views/Likes ──────────────────────────────────
  function uploadPost(postData) {
    if (containsBadWords(postData.caption) || containsBadWords(postData.title)) {
      alert("Content blocked by auto-moderation safety filters.");
      return null;
    }
    const newPost = {
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      likes: [],
      views: 1,
      comments: [],
      xpEarned: 25,
      ...postData,
    };
    setPosts(prev => [newPost, ...prev]);
    // XP + vlogger badge check
    setStreakData(prev => {
      const totalPosts = (prev.totalPosts || 0) + 1;
      let badges = [...(prev.badges || [])];
      if (totalPosts >= 3 && !badges.includes('vlogger')) badges.push('vlogger');
      return { ...prev, xp: (prev.xp || 0) + 25, totalPosts, badges };
    });
    return newPost;
  }

  function likePost(postId, userId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const currentLikes = p.likes || [];
      const liked = currentLikes.includes(userId);
      return {
        ...p,
        likes: liked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId]
      };
    }));
  }

  function incrementPostViews(postId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, views: (p.views || 0) + 1 };
    }));
  }

  function deletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  function addComment(postId, comment) {
    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : { ...p, comments: [...(p.comments || []), comment] }
    ));
  }

  // ── Stranger Trips Operations ────────────────────────────────
  function createStrangerTrip(tripData) {
    const newTrip = {
      id: `strip-${Date.now()}`,
      members: [
        {
          id: tripData.hostId,
          name: tripData.hostName,
          avatar: tripData.hostAvatar,
          role: 'Host',
        }
      ],
      chatMessages: [
        {
          id: `tm-${Date.now()}`,
          senderId: tripData.hostId,
          senderName: tripData.hostName,
          text: `Trip created! Looking for fellow travelers to join ${tripData.destinationName}. Welcome aboard! 🎒`,
          timestamp: new Date().toISOString(),
        }
      ],
      ...tripData,
    };
    setStrangerTrips(prev => [newTrip, ...prev]);
    awardXP(50, 'squad_leader');
    return newTrip;
  }

  function joinStrangerTrip(tripId, currentUser) {
    setStrangerTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const alreadyJoined = (trip.members || []).some(m => m.id === currentUser.id);
      if (alreadyJoined) return trip;
      if (trip.members.length >= trip.maxMembers) return trip;

      const updatedMembers = [
        ...trip.members,
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar || currentUser.name.slice(0, 2),
          role: 'Member',
        }
      ];

      const joinAnnouncement = {
        id: `tm-${Date.now()}`,
        senderId: 'system',
        senderName: 'SmartTour Squad',
        text: `🎉 ${currentUser.name} joined the squad! (${updatedMembers.length}/${trip.maxMembers})`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...trip,
        members: updatedMembers,
        chatMessages: [...(trip.chatMessages || []), joinAnnouncement],
      };
    }));

    awardXP(35, 'squad_leader');
  }

  function leaveStrangerTrip(tripId, userId) {
    setStrangerTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        members: (trip.members || []).filter(m => m.id !== userId),
      };
    }));
  }

  function sendTripMessage(tripId, sender, text) {
    if (!text.trim()) return;
    const msg = {
      id: `tm-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar || sender.name.slice(0, 2),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setStrangerTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        chatMessages: [...(trip.chatMessages || []), msg],
      };
    }));
  }

  // ── Streak & Rewards ─────────────────────────────────────────
  function updateStreak(userId, overrideLastLoginDate = null) {
    const today = new Date().toDateString();
    setStreakData(prev => {
      const effectiveLastLogin = overrideLastLoginDate || prev.lastLoginDate;
      if (!overrideLastLoginDate && effectiveLastLogin === today) return prev; // already done today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = effectiveLastLogin === yesterday.toDateString();

      let newStreak = isConsecutive ? (prev.currentStreak || 0) + 1 : 1;
      let badges = [...(prev.badges || [])];
      let rewards = [...(prev.rewards || [])];
      let bonusXP = 10;

      // seedling
      if (!badges.includes('seedling')) badges.push('seedling');

      // 7-day streak → travel ticket
      if (newStreak >= 7 && !badges.includes('7day_flame')) {
        badges.push('7day_flame');
        bonusXP += 100;
        rewards.push({
          id: `rwd-${Date.now()}`,
          type: 'travel_ticket',
          icon: '🎟️',
          title: 'Free Day Tour Ticket',
          description: 'You earned a free guided day tour to any Tamil Nadu destination! Valid 30 days.',
          destinations: ['Mahabalipuram', 'Thanjavur', 'Kodaikanal', 'Rameswaram', 'Ooty', 'Kanyakumari'],
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
          claimed: false,
          earnedAt: new Date().toISOString(),
        });
      }

      // 30-day streak → hotel table booking
      if (newStreak >= 30 && !badges.includes('30day_gold')) {
        badges.push('30day_gold');
        bonusXP += 500;
        rewards.push({
          id: `rwd-${Date.now()}-h`,
          type: 'hotel_booking',
          icon: '🍽️',
          title: 'Free Table Booking',
          description: '30-day streak! Claim a complimentary table booking at partner restaurants near TN spots.',
          hotels: ['Sterling Kodai Lake', 'Ideal River View Resort', 'Thanjavur Grand', 'Madurai Residency', 'Sea Side Inn Kanyakumari'],
          validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
          claimed: false,
          earnedAt: new Date().toISOString(),
        });
      }

      const loginHistory = [...(prev.loginHistory || []), today].slice(-90);
      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak || 0, newStreak),
        lastLoginDate: today,
        xp: (prev.xp || 0) + bonusXP,
        badges,
        rewards,
        loginHistory,
      };
    });
  }

  function awardXP(amount, badge = null) {
    setStreakData(prev => {
      const badges = badge && !(prev.badges || []).includes(badge)
        ? [...(prev.badges || []), badge] : (prev.badges || []);
      return { ...prev, xp: (prev.xp || 0) + amount, badges };
    });
  }

  function claimReward(rewardId) {
    setStreakData(prev => ({
      ...prev,
      rewards: (prev.rewards || []).map(r => r.id === rewardId ? { ...r, claimed: true } : r),
    }));
  }

  // ── Business Giving Reward to Tourist ────────────────────────
  function issueBusinessReward(touristId, businessId, businessName, rewardTitle, rewardDesc, type = 'business_gift') {
    const secretCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newReward = {
      id: `rwd-biz-${Date.now()}`,
      type: type,
      icon: '🎁',
      title: rewardTitle,
      description: `Gifted by ${businessName}: ${rewardDesc}`,
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
      claimed: false,
      earnedAt: new Date().toISOString(),
      issuedBy: businessName,
      businessId: businessId,
      touristId: touristId,
      secretCode: secretCode
    };

    setStreakDataMap(prev => {
      const current = prev[touristId] || defaultStreakData;
      const updatedRewards = [newReward, ...(current.rewards || [])];
      return { ...prev, [touristId]: { ...current, rewards: updatedRewards } };
    });
    
    return newReward;
  }

  function verifyRewardCode(code, businessId) {
    let verified = false;
    let touristName = '';
    
    setStreakDataMap(prev => {
      let next = { ...prev };
      for (const [tId, tData] of Object.entries(next)) {
        if (!tData.rewards) continue;
        const rewardIndex = tData.rewards.findIndex(r => 
          r.secretCode === code && 
          r.businessId === businessId && 
          !r.claimed
        );
        if (rewardIndex !== -1) {
          verified = true;
          // find tourist name
          const user = users.find(u => u.id === tId);
          touristName = user ? user.name : tId;
          
          const newRewards = [...tData.rewards];
          newRewards[rewardIndex] = { ...newRewards[rewardIndex], claimed: true };
          next[tId] = { ...tData, rewards: newRewards };
          break; // Found and verified
        }
      }
      return next;
    });

    return { success: verified, touristName };
  }

  // ── Universal Messaging (Any ID to Any ID) ───────────────────
  function sendMessage(fromUserId, toUserId, content) {
    if (!content.trim()) return;
    if (containsBadWords(content)) {
      alert("Message blocked by auto-moderation safety filters.");
      return null;
    }
    const cleanFrom = fromUserId.trim();
    const cleanTo = toUserId.trim();
    const convId = [cleanFrom, cleanTo].sort().join('_');

    // Register users in local mock state if not found
    setUsers(prev => {
      let updated = [...prev];
      if (!updated.some(u => u.id === cleanFrom)) {
        updated.push({
          id: cleanFrom,
          name: cleanFrom.startsWith('biz') ? `Business (${cleanFrom})` : `User ${cleanFrom}`,
          role: cleanFrom.startsWith('biz') ? 'business' : 'tourist',
          avatar: cleanFrom.slice(0, 2).toUpperCase(),
          location: 'Tamil Nadu',
          followers: 12,
          following: 8,
          interests: ['travel', 'culture']
        });
      }
      if (!updated.some(u => u.id === cleanTo)) {
        updated.push({
          id: cleanTo,
          name: cleanTo.startsWith('biz') ? `Business (${cleanTo})` : `User ${cleanTo}`,
          role: cleanTo.startsWith('biz') ? 'business' : 'tourist',
          avatar: cleanTo.slice(0, 2).toUpperCase(),
          location: 'Tamil Nadu',
          followers: 24,
          following: 15,
          interests: ['exploration', 'photography']
        });
      }
      return updated;
    });

    const msg = {
      id: `msg-${Date.now()}`,
      senderId: cleanFrom,
      receiverId: cleanTo,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), msg],
    }));

    setConversations(prev => {
      const exists = prev.find(c => c.id === convId);
      if (exists) {
        return prev.map(c => c.id === convId
          ? { ...c, lastMessage: content.trim(), lastTimestamp: msg.timestamp }
          : c);
      }
      return [{
        id: convId,
        participants: [cleanFrom, cleanTo],
        lastMessage: content.trim(),
        lastTimestamp: msg.timestamp,
      }, ...prev];
    });

    // award connector badge after 5 chats
    setStreakData(prev => {
      const totalChats = (prev.totalChats || 0) + 1;
      let badges = [...(prev.badges || [])];
      if (totalChats >= 5 && !badges.includes('connector')) badges.push('connector');
      return { ...prev, totalChats, badges };
    });
  }

  function deleteMessage(convId, msgId) {
    setMessages(prev => {
      const convMsgs = prev[convId] || [];
      return {
        ...prev,
        [convId]: convMsgs.filter(m => m.id !== msgId)
      };
    });
  }

  // ── Opinions (tourist → business) ────────────────────────────
  function addOpinion(opinion) {
    if (containsBadWords(opinion.comment)) {
      alert("Opinion blocked by auto-moderation safety filters.");
      return null;
    }
    const newOp = {
      id: `op-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reactions: [],
      responses: [],
      helpful: 0,
      ...opinion,
    };
    setOpinions(prev => [newOp, ...prev]);
    sendOpinionToServer(newOp);

    setStreakData(prev => {
      const totalOpinions = (prev.totalOpinions || 0) + 1;
      let badges = [...(prev.badges || [])];
      if (totalOpinions >= 5 && !badges.includes('reviewer')) badges.push('reviewer');
      return { ...prev, xp: (prev.xp || 0) + 15, totalOpinions, badges };
    });
    return newOp;
  }

  // Business Reacts with Emojis (👍, ❤️, 💡, 🔥, 🙏)
  function reactToOpinion(opinionId, emoji, fromUserId) {
    setOpinions(prev => prev.map(op => {
      if (op.id !== opinionId) return op;
      const currentReactions = op.reactions || [];
      const exists = currentReactions.find(r => r.emoji === emoji && r.from === fromUserId);
      const updated = exists
        ? currentReactions.filter(r => !(r.emoji === emoji && r.from === fromUserId))
        : [...currentReactions, { emoji, from: fromUserId, timestamp: new Date().toISOString() }];
      return { ...op, reactions: updated };
    }));
    reactToOpinionOnServer(opinionId, emoji, fromUserId);
  }

  // Business Responds with Official Reply
  function respondToOpinion(opinionId, replyText, responderUser) {
    if (!replyText.trim()) return;
    const responseObj = {
      id: `resp-${Date.now()}`,
      responderId: responderUser?.id || 'business',
      responderName: responderUser?.name || 'Business Owner',
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
    };
    setOpinions(prev => prev.map(op => {
      if (op.id !== opinionId) return op;
      return { ...op, responses: [...(op.responses || []), responseObj] };
    }));
    respondToOpinionOnServer(opinionId, responseObj);
  }

  function deleteOpinion(opinionId) {
    setOpinions(prev => prev.filter(op => op.id !== opinionId));
  }

  // ── Mindset Dataset Management & Model Retraining ────────────
  function uploadCustomDataset(newItems) {
    if (!newItems || newItems.length === 0) return;
    setMindsetDataset(prev => {
      const merged = [...newItems, ...prev];
      return merged;
    });
    setModelTrainedAt(new Date().toISOString());
    uploadDatasetToServer(newItems);
  }

  function resetToDefaultDataset() {
    setMindsetDataset(DEFAULT_MINDSET_DATASET);
    setModelTrainedAt(new Date().toISOString());
  }

  function retrainModel() {
    setModelTrainedAt(new Date().toISOString());
    awardXP(20);
  }

  // ── Existing functions ────────────────────────────────────────
  function addEmergencyRequest(req) { setEmergencyRequests(p => [req, ...p]); setSosActive(true); }
  function addReport(report) { setReports(p => [report, ...p]); }
  function addBooking(booking) {
    setBookings(p => [booking, ...p]);
    awardXP(50, 'explorer');
  }
  function resolveEmergency(id) {
    setEmergencyRequests(p => p.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  }

  return (
    <AppContext.Provider value={{
      destinations, businesses, emergencyRequests, bookings, reports, alerts,
      activeTab, setActiveTab, selectedDestination, setSelectedDestination,
      sosActive, setSosActive, addEmergencyRequest, addReport, addBooking, resolveEmergency,
      // media & real views
      posts, uploadPost, likePost, deletePost, incrementPostViews, addComment,
      // stories
      stories, addStory, deleteStory, viewStory, reactToStory,
      // stranger trips
      strangerTrips, createStrangerTrip, joinStrangerTrip, leaveStrangerTrip, sendTripMessage,
      // streak & rewards
      streakData, updateStreak, awardXP, claimReward, issueBusinessReward, verifyRewardCode,
      // messaging & simulator
      conversations, messages, sendMessage, deleteMessage, simulatedActiveUserId, setSimulatedActiveUserId,
      // opinions & reactions
      opinions, addOpinion, deleteOpinion, reactToOpinion, respondToOpinion,
      // dataset & mindset model
      mindsetDataset, modelTrainedAt, uploadCustomDataset, resetToDefaultDataset, retrainModel,
      // users
      users,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

