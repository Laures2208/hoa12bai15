import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Shield, ChevronRight, User, GraduationCap, Lock, Unlock, Zap, Database, LogOut, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot, getDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { checkAndResetGatekeeper } from '../utils/gatekeeperHelper';
import { MessageSquare } from 'lucide-react';

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
  onEnter: (studentInfo: { name: string; studentClass: string }) => void;
  onAdminAccess: () => void;
}

export const GatewayPage: React.FC<GatewayPageProps> = ({ onEnter, onAdminAccess }) => {
  const [time, setTime] = useState(new Date());
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState({ examsCompleted: 0, totalScore: 0 });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [status, setStatus] = useState<'unregistered' | 'waiting' | 'approved' | 'blocked'>('unregistered');
  const [passcode, setPasscode] = useState('');
  const [isCheckingPasscode, setIsCheckingPasscode] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

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

  // Check local storage for existing session
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let isMounted = true;

    const checkSavedSession = async () => {
      const savedSession = localStorage.getItem('lkt_student_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const studentName = parsed.name || '';
        const sClass = parsed.studentClass || '';
        setName(studentName);
        setStudentClass(sClass);
        fetchProgress(studentName, sClass);
        
        const sessionId = `${studentName}_${sClass}`.replace(/\s+/g, '_');
        
        try {
          const sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
          if (sessionDoc.exists()) {
            const data = sessionDoc.data();
            const currentStatus = data.status;
            const lastActive = data.lastActive;
            const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();
            
            if (!isToday && currentStatus !== 'blocked') {
              await deleteDoc(doc(db, 'student_sessions', sessionId));
              if (isMounted) {
                setStatus('unregistered');
                localStorage.removeItem('lkt_student_session');
              }
              return;
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'student_sessions/' + sessionId);
        }

        if (isMounted) {
          unsub = onSnapshot(doc(db, 'student_sessions', sessionId), (docSnap) => {
            if (docSnap.exists()) {
              setStatus(docSnap.data().status as any);
            } else {
              setStatus('unregistered');
              localStorage.removeItem('lkt_student_session');
            }
          }, (error) => handleFirestoreError(error, OperationType.GET, 'student_sessions/' + sessionId));
        }
      }
    };

    checkSavedSession();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  // Real-time status check when name or class changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!name.trim() || !studentClass.trim()) {
        setStatus('unregistered');
        return;
      }
      
      const sessionId = `${name.trim()}_${studentClass.trim()}`.replace(/\s+/g, '_');
      let sessionDoc;
      try {
        sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'student_sessions/' + sessionId);
        return;
      }
      
      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        const currentStatus = data.status as any;
        const lastActive = data.lastActive;
        const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();

        if (!isToday && currentStatus !== 'blocked') {
          try {
            await deleteDoc(doc(db, 'student_sessions', sessionId));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, 'student_sessions/' + sessionId);
          }
          setStatus('unregistered');
          localStorage.removeItem('lkt_student_session');
          return;
        }

        setStatus(currentStatus);
        
        // If blocked, immediately update local storage if it matches
        if (currentStatus === 'blocked') {
          const savedSession = localStorage.getItem('lkt_student_session');
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed.name === name.trim() && parsed.studentClass === studentClass.trim()) {
              // Keep it in localStorage so the "Bạn đã bị chặn" message stays, 
              // but we ensure status is blocked
            }
          }
        }
      } else {
        setStatus('unregistered');
      }
    };

    const timeoutId = setTimeout(checkStatus, 500); // Debounce check
    return () => clearTimeout(timeoutId);
  }, [name, studentClass]);

  const fetchProgress = async (studentName: string, sClass: string) => {
    if (!studentName || !sClass) return;
    setIsLoadingProgress(true);
    try {
      let completed = 0;
      let score = 0;

      const q = query(
        collection(db, 'results'),
        where('studentName', '==', studentName),
        where('studentClass', '==', sClass)
      );
      
      let snap;
      try {
        snap = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'results');
        return;
      }
      
      if (!snap.empty) {
        completed += snap.size;
        snap.forEach(doc => score += doc.data().score || 0);
      }

      setProgress({ examsCompleted: completed, totalScore: score });
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentClass.trim()) return;

    const info = { name: name.trim(), studentClass: studentClass.trim() };
    
    const sessionId = `${info.name}_${info.studentClass}`.replace(/\s+/g, '_');
    try {
      let sessionDoc;
      try {
        sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'student_sessions/' + sessionId);
        return;
      }
      
      if (sessionDoc.exists() && sessionDoc.data().status === 'blocked') {
        alert("Tài khoản này đã bị chặn bởi Giáo viên. Bạn không thể đăng ký lại.");
        return;
      }

      const gatekeeperConfig = await checkAndResetGatekeeper();
      const autoApprove = gatekeeperConfig ? gatekeeperConfig.autoApprove : true;
      
      const newStatus = autoApprove ? 'approved' : 'waiting';
      
      await setDoc(doc(db, 'student_sessions', sessionId), {
        name: info.name,
        studentClass: info.studentClass,
        status: newStatus,
        lastActive: Date.now()
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'student_sessions/' + sessionId));

      localStorage.setItem('lkt_student_session', JSON.stringify(info));
      setStatus(newStatus);
      fetchProgress(info.name, info.studentClass);
      
      // Setup listener for status
      onSnapshot(doc(db, 'student_sessions', sessionId), (docSnap) => {
        if (docSnap.exists()) {
          setStatus(docSnap.data().status as any);
        } else {
          setStatus('unregistered');
          localStorage.removeItem('lkt_student_session');
        }
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'student_sessions/' + sessionId);
        } catch (e) {
          setFirestoreError(e instanceof Error ? e : new Error(String(e)));
        }
      });

    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error registering:", error);
      alert("Có lỗi xảy ra khi đăng ký.");
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 4) return;
    
    const sessionId = `${name.trim()}_${studentClass.trim()}`.replace(/\s+/g, '_');
    setIsCheckingPasscode(true);
    try {
      const gatekeeperConfig = await checkAndResetGatekeeper();
      const correctPasscode = gatekeeperConfig ? gatekeeperConfig.passcode : '';
      
      if (passcode === correctPasscode) {
      let sessionDoc;
      try {
        sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'student_sessions/' + sessionId);
        return;
      }
      
      if (sessionDoc.exists() && sessionDoc.data().status === 'blocked') {
          alert("Tài khoản này đã bị chặn bởi Giáo viên.");
          return;
        }
        
        await setDoc(doc(db, 'student_sessions', sessionId), { 
          status: 'approved',
          lastActive: Date.now()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'student_sessions/' + sessionId));
        setStatus('approved');
      } else {
        alert('Mã Passcode không chính xác!');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error checking passcode:", error);
    } finally {
      setIsCheckingPasscode(false);
      setPasscode('');
    }
  };

  const handleEnterLab = async () => {
    const sessionId = `${name.trim()}_${studentClass.trim()}`.replace(/\s+/g, '_');
    // Re-verify status one last time before entering
    let sessionDoc;
    try {
      sessionDoc = await getDoc(doc(db, 'student_sessions', sessionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'student_sessions/' + sessionId);
      return;
    }
    
    if (!sessionDoc.exists() || sessionDoc.data().status !== 'approved') {
      const currentStatus = sessionDoc.exists() ? sessionDoc.data().status : 'unregistered';
      setStatus(currentStatus as any);
      if (currentStatus === 'blocked') {
        alert("Tài khoản này đã bị chặn bởi Giáo viên. Bạn không thể vào phòng thí nghiệm.");
      } else {
        alert("Bạn chưa được duyệt để vào phòng thí nghiệm!");
      }
      return;
    }

    const data = sessionDoc.data();
    const lastActive = data.lastActive;
    const isToday = lastActive && new Date(lastActive).toDateString() === new Date().toDateString();

    if (!isToday && data.status !== 'blocked') {
      try {
        await deleteDoc(doc(db, 'student_sessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'student_sessions/' + sessionId);
      }
      setStatus('unregistered');
      localStorage.removeItem('lkt_student_session');
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng ký lại cho ngày hôm nay.");
      return;
    }

    setIsExiting(true);
    setTimeout(() => {
      onEnter({ name: name.trim(), studentClass: studentClass.trim() });
    }, 500); // 0.5s fade-out
  };

  const hasRegistered = status !== 'unregistered';

  return (
    <AnimatePresence>
      {!isExiting && (
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
                LUYỆN KIM THUẬT
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

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
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

                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Họ và Tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập họ tên của bạn..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Lớp</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        placeholder="Ví dụ: 12A1"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                      {hasRegistered ? 'Cập nhật thông tin' : 'Đăng ký truy cập'}
                    </button>
                    {hasRegistered && (
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('lkt_student_session');
                          setName('');
                          setStudentClass('');
                          setProgress({ examsCompleted: 0, totalScore: 0 });
                        }}
                        className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl transition-colors border border-rose-500/20 flex items-center justify-center gap-2"
                        title="Đăng xuất"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">Đăng xuất</span>
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>

              {/* Status & Progress Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Access Status */}
                <div className={cn(
                  "border rounded-2xl p-6 backdrop-blur-sm transition-all duration-500",
                  status === 'approved' ? "bg-teal-900/20 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.2)]" :
                  status === 'waiting' ? "bg-amber-900/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]" :
                  status === 'blocked' ? "bg-rose-900/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]" :
                  "bg-slate-900/50 border-slate-800"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-full",
                      status === 'approved' ? "bg-teal-500/20 text-teal-400" :
                      status === 'waiting' ? "bg-amber-500/20 text-amber-400" :
                      status === 'blocked' ? "bg-rose-500/20 text-rose-400" :
                      "bg-slate-800 text-slate-500"
                    )}>
                      {status === 'approved' ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Trạng thái truy cập</h3>
                      <p className={cn("text-sm", 
                        status === 'approved' ? "text-teal-400" :
                        status === 'waiting' ? "text-amber-400" :
                        status === 'blocked' ? "text-rose-400" :
                        "text-slate-500"
                      )}>
                        {status === 'approved' ? 'Đã cấp quyền truy cập Lab' :
                         status === 'waiting' ? 'Đang chờ giáo viên duyệt...' :
                         status === 'blocked' ? 'Bạn đã bị chặn' :
                         'Chưa xác thực danh tính'}
                      </p>
                    </div>
                  </div>
                  
                  {status === 'waiting' && (
                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                      <p className="text-xs text-amber-500/80 mb-2">Vào nhanh bằng Passcode:</p>
                      <form onSubmit={handlePasscodeSubmit} className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength={4}
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Nhập 4 số..."
                          className="flex-1 bg-slate-950 border border-amber-500/30 rounded-lg py-2 px-3 text-white text-center tracking-widest font-mono focus:border-amber-500 outline-none"
                        />
                        <button 
                          type="submit"
                          disabled={isCheckingPasscode || passcode.length !== 4}
                          className="px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg disabled:opacity-50 transition-colors"
                        >
                          {isCheckingPasscode ? '...' : 'Vào'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-teal-500" />
                      Tiến trình học tập
                    </h3>
                    {isLoadingProgress && <span className="text-xs text-teal-500 animate-pulse">Đang đồng bộ...</span>}
                  </div>
                  
                  {hasRegistered ? (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-teal-400 mb-1">{progress.examsCompleted}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Bài thi đã nộp</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                        <span className="text-3xl font-black text-emerald-400 mb-1">
                          {progress.examsCompleted > 0 ? (progress.totalScore / progress.examsCompleted).toFixed(1) : "0.0"}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Điểm trung bình</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-sm text-center">
                      <Zap className="w-8 h-8 mb-3 opacity-20" />
                      <p>Đăng ký để xem tiến trình<br/>của bạn từ Firebase</p>
                    </div>
                  )}
                </div>

                {/* Enter Button */}
                <button
                  onClick={handleEnterLab}
                  disabled={status !== 'approved'}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300",
                    status === 'approved' 
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500 shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:scale-[1.02]" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  )}
                >
                  CỔNG PHÒNG THÍ NGHIỆM
                  <ChevronRight className="w-6 h-6" />
                </button>

                {status !== 'unregistered' && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('lkt_student_session');
                      setStatus('unregistered');
                      setName('');
                      setStudentClass('');
                    }}
                    className="w-full py-3 mt-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                  >
                    Quay lại đăng ký
                  </button>
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
                Phiên bản 1.5.3
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
      )}
    </AnimatePresence>
  );
};
