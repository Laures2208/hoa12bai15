import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar, 
  Phone, 
  GraduationCap, 
  Send, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';

interface StudentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
}

export const StudentSettingsModal: React.FC<StudentSettingsModalProps> = ({ isOpen, onClose, uid }) => {
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ type: 'profile' | 'password', message: string } | null>(null);

  // Original Profile from DB
  const [originalProfile, setOriginalProfile] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [grade, setGrade] = useState<'10' | '11' | '12'>('12');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Pending profile update request
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !uid) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setNewPassword('');
    setCurrentPasswordInput('');

    // Listen to user document
    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOriginalProfile(data);
        setName(data.name || '');
        setStudentClass(data.studentClass || '');
        setGrade(data.grade || '12');
        setDob(data.dob || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setPassword(data.password || '');
      } else {
        setError('Không tìm thấy tài khoản trong hệ thống.');
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Đã xảy ra lỗi khi tải thông tin tài khoản.');
      setLoading(false);
    });

    // Listen to pending request
    const requestDocRef = doc(db, 'profile_update_requests', uid);
    const unsubRequest = onSnapshot(requestDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPendingRequest(docSnap.data());
      } else {
        setPendingRequest(null);
      }
    });

    return () => {
      unsubUser();
      unsubRequest();
    };
  }, [isOpen, uid]);

  // Request Profile Info Change for Admin approval
  const handleRequestProfileChange = async () => {
    if (!uid || !originalProfile) return;
    setError(null);
    setSuccessMsg(null);

    const cleanName = name.trim().toUpperCase();
    const cleanClass = studentClass.trim().toUpperCase();
    const cleanDoc = {
      userId: uid,
      currentName: originalProfile.name || '',
      currentClass: originalProfile.studentClass || '',
      currentGrade: originalProfile.grade || '12',
      currentDob: originalProfile.dob || '',
      currentPhone: originalProfile.phone || '',
      requestedName: cleanName,
      requestedClass: cleanClass,
      requestedGrade: grade,
      requestedDob: dob,
      requestedPhone: phone.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    if (!cleanName || !cleanClass || !dob || !phone.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin cá nhân.');
      return;
    }

    // Check if anything actually changed
    const noChange = 
      cleanName === originalProfile.name &&
      cleanClass === originalProfile.studentClass &&
      grade === originalProfile.grade &&
      dob === originalProfile.dob &&
      phone.trim() === originalProfile.phone;

    if (noChange) {
      setError('Thông tin mới trùng khớp với thông tin hiện tại, không có gì thay đổi.');
      return;
    }

    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'profile_update_requests', uid), cleanDoc);
      setSuccessMsg({ 
        type: 'profile', 
        message: 'Đã gửi yêu cầu thay đổi thông tin cá nhân thành công! Vui lòng chờ Admin phê duyệt.' 
      });
    } catch (err: any) {
      console.error(err);
      setError('Không thể gửi yêu cầu thay đổi tới Admin: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Directly Change Password
  const handleChangePassword = async () => {
    if (!uid) return;
    setError(null);
    setSuccessMsg(null);

    const cleanCurrentPass = currentPasswordInput.trim();
    const cleanSavedPass = password.trim();
    if (cleanCurrentPass !== cleanSavedPass) {
      setError('Mật khẩu hiện tại không chính xác.');
      return;
    }

    const cleanNewPass = newPassword.trim();
    if (!cleanNewPass) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (cleanNewPass.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (cleanNewPass === cleanSavedPass) {
      setError('Mật khẩu mới trùng với mật khẩu cũ.');
      return;
    }

    setSavingPassword(true);
    try {
      // 1. Force update password directly in Firebase Authentication
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await updatePassword(currentUser, cleanNewPass);
        } catch (authErr: any) {
          console.warn("Could not update auth password immediately, updating database instead:", authErr);
          if (authErr.code === 'auth/requires-recent-login') {
            console.info("Requires re-authentication, we will persist updated password to Firestore so next login transitions it.");
          }
        }
      }

      // 2. Update user document password
      await updateDoc(doc(db, 'users', uid), {
        password: cleanNewPass
      });

      setNewPassword('');
      setCurrentPasswordInput('');
      setSuccessMsg({
        type: 'password',
        message: 'Thay đổi mật khẩu thành công!'
      });
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi thay đổi mật khẩu: ' + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelPendingRequest = async () => {
    if (!uid) return;
    if (window.confirm('Bạn muốn hủy yêu cầu đặt đổi thông tin đang chờ duyệt?')) {
      try {
        await deleteDoc(doc(db, 'profile_update_requests', uid));
        setSuccessMsg(null);
      } catch (err: any) {
        console.error(err);
        setError('Không thể hủy yêu cầu: ' + err.message);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="p-2.5 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
                  <Key className="w-6 h-6" />
                </span>
                Thông tin & Bảo mật tài khoản
              </h3>
              <p className="text-slate-400 text-sm mt-2">Cấu hình thông tin cá nhân và thay đổi mật khẩu của bạn.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-2" />
                <p className="text-sm">Đang tải thông tin tài khoản...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Global Notification Messages */}
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                
                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg.message}</span>
                  </div>
                )}

                {/* Section 1: Account Info Change Request */}
                <div className="bg-slate-800/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 border-b border-slate-850 pb-2">
                    <User className="w-4 h-4" />
                    Thông tin cá nhân (Cần Admin phê duyệt)
                  </h4>

                  {/* Informational Warning about Pending Request */}
                  {pendingRequest && (
                    <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Bạn đang có yêu cầu thay đổi thông tin chưa duyệt:</span>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-lg space-y-1 font-mono text-[11px] text-slate-350">
                        <div>Họ tên: {originalProfile.name} → <span className="text-yellow-400">{pendingRequest.requestedName}</span></div>
                        <div>Lớp: {originalProfile.studentClass} (Khối {originalProfile.grade}) → <span className="text-yellow-400">{pendingRequest.requestedClass} (Khối {pendingRequest.requestedGrade})</span></div>
                        <div>SDT: {originalProfile.phone} → <span className="text-yellow-400">{pendingRequest.requestedPhone}</span></div>
                        <div>Ngày sinh: {originalProfile.dob?.split('-').reverse().join('/')} → <span className="text-yellow-400">{pendingRequest.requestedDob?.split('-').reverse().join('/')}</span></div>
                      </div>
                      <button
                        onClick={handleCancelPendingRequest}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline transition-colors"
                      >
                        Huỷ yêu cầu này
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Họ và tên</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VÍ DỤ: NGUYỄN VĂN A"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại"
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Khối lớp</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value as any)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm font-semibold h-[38px] appearance-none"
                        >
                          <option value="10">Khối 10</option>
                          <option value="11">Khối 11</option>
                          <option value="12">Khối 12</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Lớp</label>
                      <input
                        type="text"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        placeholder="Ví dụ: 12A7"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm font-bold uppercase"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Ngày sinh</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm font-semibold text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleRequestProfileChange}
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Yêu cầu đổi thông tin cá nhân
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section 2: Password Change directly */}
                <div className="bg-slate-800/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 border-b border-slate-850 pb-2">
                    <Lock className="w-4 h-4" />
                    Đổi mật khẩu tài khoản (Cập nhật ngay)
                  </h4>

                  {/* Helpers to detect if the input current password matches */}
                  {currentPasswordInput && currentPasswordInput.trim() !== password && (
                    <p className="text-rose-400 text-xs font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Mật khẩu hiện tại chưa khớp. Vui lòng nhập đúng để đổi.
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={currentPasswordInput}
                          onChange={(e) => {
                            setCurrentPasswordInput(e.target.value);
                            setError(null);
                            setSuccessMsg(null);
                          }}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="w-full pl-4 pr-10 py-2 bg-slate-950 border border-slate-700/80 rounded-xl outline-none focus:border-teal-500 text-sm text-slate-100 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-350"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                        Mật khẩu mới {currentPasswordInput.trim() !== password && <span className="text-rose-400 text-[10px] font-normal italic ml-1">(Nhập đúng mật khẩu hiện tại trước)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setError(null);
                            setSuccessMsg(null);
                          }}
                          disabled={currentPasswordInput.trim() !== password}
                          placeholder={currentPasswordInput.trim() === password ? "Mật khẩu tối thiểu 6 kí tự" : "Nhập đúng mật khẩu hiện tại để mở khoá"}
                          className={cn(
                            "w-full pl-4 pr-10 py-2 bg-slate-950 border rounded-xl outline-none text-sm font-mono transition-all",
                            currentPasswordInput.trim() === password 
                              ? "border-emerald-500/50 focus:border-emerald-400 text-slate-200" 
                              : "border-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
                          )}
                        />
                        <button
                          type="button"
                          disabled={currentPasswordInput.trim() !== password}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-350 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword || currentPasswordInput.trim() !== password}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {savingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Thay đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Read-Only Account System Details */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">Email đăng nhập:</span>
                    <span className="font-mono text-slate-400">{email || 'Chưa định cấu hình'}</span>
                  </div>
                  <div>
                    <span className="font-bold">UID tài khoản:</span>
                    <span className="font-mono text-[10px] ml-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">{uid}</span>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
