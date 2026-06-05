import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { Clock, Shield, ChevronRight, User, GraduationCap, Lock, Unlock, Zap, Database, LogOut, Bell, Mail, Key, Phone, Calendar, CheckSquare, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot, getDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { checkAndResetGatekeeper } from '../utils/gatekeeperHelper';
import { MessageSquare } from 'lucide-react';
import { useBatterySaver } from '../context/BatterySaverContext';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface GatewayPageProps {
  onEnter: (studentInfo: { name: string; studentClass: string; grade: '10' | '11' | '12' }) => void;
  onAdminAccess: () => void;
}

export const GatewayPage: React.FC<GatewayPageProps> = ({ onEnter, onAdminAccess }) => {
  const { isBatterySaver, toggleBatterySaver } = useBatterySaver();
  const [time, setTime] = useState(new Date());
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [grade, setGrade] = useState<'10' | '11' | '12' | ''>('');
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [forgotName, setForgotName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  if (firestoreError) {
    throw firestoreError;
  }

  // Fetch recent announcements
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRecentAnnouncements(list);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      } catch (e) {
        setFirestoreError(e instanceof Error ? e : new Error(String(e)));
      }
    });
    return () => unsub();
  }, []);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getAuthPassword = (emailStr: string) => "StuAuth_" + emailStr.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setForgotSuccess('');
    setAuthLoading(true);

    try {
      if (!forgotName.trim() || !forgotEmail.trim() || !forgotPhone.trim()) {
        throw new Error('Vui lòng nhập đầy đủ các trường thông tin.');
      }

      // Query if student with this email exists
      const qUsers = query(collection(db, 'users'), where('email', '==', forgotEmail.trim().toLowerCase()));
      const snapshot = await getDocs(qUsers);
      if (snapshot.empty) {
        throw new Error('Không tìm thấy tài khoản học sinh ứng với email này.');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Check matching details helper
      const isNameMatching = userData.name?.toUpperCase().trim() === forgotName.toUpperCase().trim();
      const isPhoneMatching = userData.phone?.trim() === forgotPhone.trim();

      if (!isNameMatching || !isPhoneMatching) {
        throw new Error('Thông tin Họ tên hoặc Số điện thoại không khớp với hồ sơ đã đăng ký.');
      }

      // Safe save or replace the pending request
      await setDoc(doc(db, 'password_reset_requests', userDoc.id), {
        userId: userDoc.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        studentClass: userData.studentClass,
        grade: userData.grade || '12',
        password: userData.password || '',
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setForgotSuccess('Yêu cầu đổi mật khẩu đã được gửi đến Giáo viên thành công! Vui lòng liên hệ trực tiếp Giáo viên để nhận mật khẩu mới hoặc đợi phê duyệt.');
    } catch (err: any) {
      console.error("Forgot password submission error:", err);
      setAuthError(err.message || 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (authMode === 'register') {
        if (!name.trim() || !studentClass.trim() || !grade || !dob || !phone || !consent) {
          throw new Error('Vui lòng điền đầy đủ thông tin và xác nhận đồng ý.');
        }

        // Check if user document already exists in users collection to prevent registering active users
        const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snapshot = await getDocs(qUsers);
        if (!snapshot.empty) {
          throw { code: 'auth/email-already-in-use' };
        }
        
        // 1. Create auth user or reuse/generate if orphan Auth account exists
        const authPass = getAuthPassword(cleanEmail);
        let finalAuthEmail = cleanEmail;
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, finalAuthEmail, authPass);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            // Authentication account exists but user document in Firestore was deleted/removed by Admin
            // Try resetting the Auth collision safely by registering under a unique mutated email
            finalAuthEmail = cleanEmail.replace('@', `_reg_${Date.now()}@`);
            userCredential = await createUserWithEmailAndPassword(auth, finalAuthEmail, authPass);
          } else {
            throw createErr;
          }
        }
        
        // 2. Save custom profile with actual clean password to users collection
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name.trim().toUpperCase(),
          studentClass: studentClass.trim().toUpperCase(),
          grade,
          dob,
          phone,
          email: cleanEmail,
          authEmail: finalAuthEmail, // Keep track of the actual Firebase Auth email used
          password: cleanPassword, // Save actual password for admin to see
          createdAt: new Date().toISOString(),
        });
        
      } else {
        // Login flow
        // 1. Check if user document exists in users collection
        const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
        let matchedUserDoc: any = null;
        try {
          const snapshot = await getDocs(qUsers);
          if (!snapshot.empty) {
            matchedUserDoc = snapshot.docs[0];
          }
        } catch (e) {
          console.error("Error querying user during login:", e);
        }

        if (matchedUserDoc) {
          const userData = matchedUserDoc.data();
          
          if (userData.password !== undefined) {
            // There is a stored password!
            if (userData.password.trim() !== cleanPassword) {
              throw new Error('Email hoặc mật khẩu không chính xác.');
            }
            
            // Password matches stored plain text!
            // Let's sign into Firebase Auth with the internal consistent auth password and resolved authEmail
            const authPass = getAuthPassword(cleanEmail);
            const resolvedAuthEmail = userData.authEmail || cleanEmail;
            let userCredential;
            try {
              userCredential = await signInWithEmailAndPassword(auth, resolvedAuthEmail, authPass);
              
              // Ensure we record the authEmail in the document if it's missing (backwards compatibility)
              if (!userData.authEmail) {
                await setDoc(doc(db, 'users', matchedUserDoc.id), {
                  authEmail: resolvedAuthEmail
                }, { merge: true });
              }

              setName(userData.name);
              setStudentClass(userData.studentClass);
              setGrade(userData.grade || '12');
            } catch (authErr: any) {
              // Fallback: If transitioning user didn't have their auth password changed yet, try with entered password
              if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
                try {
                  userCredential = await signInWithEmailAndPassword(auth, resolvedAuthEmail, cleanPassword);
                  
                  // Transition their auth password now!
                  if (auth.currentUser) {
                    await updatePassword(auth.currentUser, authPass);
                  }

                  await setDoc(doc(db, 'users', matchedUserDoc.id), {
                    authEmail: resolvedAuthEmail
                  }, { merge: true });
                  
                  setName(userData.name);
                  setStudentClass(userData.studentClass);
                  setGrade(userData.grade || '12');
                } catch (failErr) {
                  throw authErr;
                }
              } else {
                throw authErr;
              }
            }
          } else {
            // Document has no plain password recorded (old system user)
            // Attempt standard FirebaseAuth login with entered password
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            
            // On success, save the password to Firestore user document and transition FirebaseAuth password
            const authPass = getAuthPassword(cleanEmail);
            try {
              await updatePassword(userCredential.user, authPass);
            } catch (err) {
              console.warn("Could not transition auth password:", err);
            }
            
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              ...userData,
              password: cleanPassword,
              authEmail: cleanEmail
            }, { merge: true });

            setName(userData.name);
            setStudentClass(userData.studentClass);
            setGrade(userData.grade || '12');
          }
        } else {
          // No custom profile doc found (could be Admin or unrecorded user)
          // Attempt standard FirebaseAuth login using entered password
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          
          // Try to fetch custom profile now
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name);
            setStudentClass(data.studentClass);
            setGrade(data.grade || '12');
          } else {
            // Admin accounts might not have a student profile doc, which is fine
          }
        }
      }
    } catch (err: any) {
      if (!err.code?.startsWith('auth/')) {
        console.error(err);
      }
      if (err.code === 'auth/email-already-in-use') setAuthError('Email này đã được đăng ký. Vui lòng chuyển qua tab Đăng nhập.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message === 'Email hoặc mật khẩu không chính xác.') setAuthError('Email hoặc mật khẩu không chính xác.');
      else if (err.code === 'auth/operation-not-allowed') setAuthError('Phương thức đăng nhập bằng Email/Mật khẩu chưa được bật trên Firebase. Vui lòng bật trong Firebase Console.');
      else setAuthError(err.message || 'Có lỗi xảy ra, vui lòng thử lại. ' + (err.code || ''));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
        <motion.div
  
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden font-sans"
        >
          {/* Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Header: Clock & Slogan */}
          <header className="p-6 flex flex-col md:flex-row justify-between items-center z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <button
                onClick={toggleBatterySaver}
                className={cn(
                  "flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-full border transition-all relative overflow-hidden group",
                  isBatterySaver ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                )}
                title="Chế độ tiết kiệm pin (Cho máy yếu)"
              >
                {isBatterySaver && (
                  <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                )}
                <div className={cn(
                  "flex items-center justify-center rounded-full p-1",
                  !isBatterySaver ? "bg-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" : "bg-transparent text-yellow-400"
                )}>
                  <Zap className="w-5 h-5 relative z-10" />
                </div>
                <span className="hidden md:inline text-sm font-bold tracking-wide relative z-10">
                  {isBatterySaver ? 'TIẾT KIỆM PIN: BẬT' : 'BẬT TIẾT KIỆM PIN'}
                </span>
                
                {/* Ping animation indicator when battery saver is off to draw attention */}
                {!isBatterySaver && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-teal-400" />
                {recentAnnouncements.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-rose-500 rounded-md text-[11px] flex items-center justify-center text-white font-bold px-1">
                    {recentAnnouncements.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-teal-400">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl tracking-wider">
                  {time.toLocaleTimeString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <h1 className="text-2xl font-black tracking-tighter text-white glow-sparkle">
                CHEMISTRY THEORY & QUIZZ
              </h1>
              <p className="text-sm text-teal-500/80 italic mt-1 font-medium tracking-wide">
                "Hợp chất đồng nhất, điểm số nghịch biến"
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
            {/* Announcements Section */}
            {recentAnnouncements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-4xl bg-slate-900/80 border border-teal-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-sm mb-8"
              >
                <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Bảng Tin</h2>
                    <p className="text-xs text-slate-400">Thông báo mới nhất từ giáo viên</p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentAnnouncements.map(announcement => (
                    <div key={announcement.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col">
                      <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{announcement.title}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                        <span className="text-teal-400">{announcement.author}</span>
                        <span>•</span>
                        <span>{announcement.createdAt?.toDate ? new Date(announcement.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Mới'}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3 opacity-80 flex-1">
                        {announcement.content.replace(/[#*`_~]/g, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="w-full max-w-md mx-auto mb-8">
              
              {/* Registration Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-sm flex flex-col justify-center"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-teal-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Xác thực danh tính</h2>
                </div>

                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl mb-6">
                  <button
                    className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", (authMode === 'login' || authMode === 'forgot') ? "bg-teal-500/20 text-teal-400" : "text-slate-500 hover:text-slate-300")}
                    onClick={() => { setAuthMode('login'); setAuthError(''); setForgotSuccess(''); }}
                  >
                    Đăng nhập
                  </button>
                  <button
                    className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", authMode === 'register' ? "bg-teal-500/20 text-teal-400" : "text-slate-500 hover:text-slate-300")}
                    onClick={() => { setAuthMode('register'); setAuthError(''); setForgotSuccess(''); }}
                  >
                    Đăng ký mới
                  </button>
                </div>

                {authError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg mb-6">
                    {authError}
                  </div>
                )}

                {authMode === 'forgot' ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4 pr-2 custom-scrollbar">
                    {forgotSuccess ? (
                      <div className="space-y-4 text-center py-4">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                          <CheckSquare className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-400 leading-relaxed">{forgotSuccess}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthError('');
                            setForgotSuccess('');
                          }}
                          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 text-sm font-bold rounded-xl transition-all border border-slate-700"
                        >
                          Quay lại Đăng nhập
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 italic mb-2">
                          Vui lòng nhập chính xác thông tin đăng ký của bạn để gửi yêu cầu đổi mật khẩu đến Giáo viên quản lý.
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Họ và Tên học sinh</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="text"
                              value={forgotName}
                              onChange={(e) => setForgotName(e.target.value)}
                              placeholder="NGUYỄN VĂN A"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all uppercase"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Email đã đăng ký</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="email@example.com"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Số điện thoại</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="tel"
                              value={forgotPhone}
                              onChange={(e) => setForgotPhone(e.target.value)}
                              placeholder="09..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('login');
                              setAuthError('');
                            }}
                            className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                          >
                            Quay lại
                          </button>
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                          >
                            {authLoading ? 'Đang gửi...' : 'Gửi yêu cầu đổi mật khẩu'}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleAuth} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {authMode === 'register' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Họ và Tên</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Nguyễn Văn A"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all uppercase"
                              required={authMode === 'register'}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Khối lớp</label>
                            <select
                              value={grade}
                              onChange={(e) => setGrade(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                              required={authMode === 'register'}
                            >
                              <option value="" disabled>Chọn khối...</option>
                              <option value="10">Khối 10</option>
                              <option value="11">Khối 11</option>
                              <option value="12">Khối 12</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Lớp</label>
                            <div className="relative">
                              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type="text"
                                value={studentClass}
                                onChange={(e) => setStudentClass(e.target.value)}
                                placeholder="12A1"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all uppercase"
                                required={authMode === 'register'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Ngày sinh</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                required={authMode === 'register'}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Số điện thoại</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                required={authMode === 'register'}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-400">Mật khẩu</label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('forgot');
                              setAuthError('');
                              setForgotSuccess('');
                              setForgotName('');
                              setForgotEmail('');
                              setForgotPhone('');
                            }}
                            className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                          >
                            Quên mật khẩu?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div 
                        className="flex items-start gap-3 mt-4 cursor-pointer"
                        onClick={() => setConsent(!consent)}
                      >
                        <div className="mt-1">
                          {consent ? <CheckSquare className="w-5 h-5 text-teal-500" /> : <Square className="w-5 h-5 text-slate-500" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Tôi xác nhận đăng ký tài khoản và cho phép hệ thống lưu trữ thông tin cá nhân (Họ tên, Lớp, Ngày sinh, Số điện thoại) để Giáo viên quản lý, cấp quyền truy cập.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                      >
                        {authLoading ? 'Đang xử lý...' : (authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản')}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

          </main>


          {/* Bottom Bar */}
          <footer className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md z-10 flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-xs text-slate-500">
                Hệ thống yêu cầu xác thực để lưu trữ kết quả học tập.
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-1">
                Phiên bản 2.2.8
              </p>
            </div>
            <button
              onClick={onAdminAccess}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-700"
            >
              Truy cập Giáo viên
            </button>
          </footer>
        </motion.div>
    </AnimatePresence>
  );
};
