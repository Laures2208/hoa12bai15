import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Plus, 
  Trash2, 
  X, 
  Save, 
  Users, 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  Edit2, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Briefcase,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';

interface StudentAccount {
  id: string; // auth uid
  name: string;
  studentClass: string;
  grade: '10' | '11' | '12' | '';
  dob: string;
  phone: string;
  email?: string;
  authEmail?: string;
  password?: string;
  status?: 'blocked' | 'approved' | '';
  createdAt?: string;
}

interface PasswordResetRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  studentClass: string;
  grade: string;
  password?: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

interface ProfileUpdateRequest {
  id: string;
  userId: string;
  currentName: string;
  currentClass: string;
  currentGrade: string;
  currentDob: string;
  currentPhone: string;
  requestedName: string;
  requestedClass: string;
  requestedGrade: string;
  requestedDob: string;
  requestedPhone: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const AdminAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'blocked'>('all');
  const [showPassword, setShowPassword] = useState(false);

  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [profileRequests, setProfileRequests] = useState<ProfileUpdateRequest[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'requests' | 'profileRequests'>('list');
  
  // Real-time listener for users
  useEffect(() => {
    const qUsers = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(qUsers, (snapshot) => {
      const usersData: StudentAccount[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        usersData.push({
          id: docSnap.id,
          name: data.name || '',
          studentClass: data.studentClass || '',
          grade: data.grade || '',
          dob: data.dob || '',
          phone: data.phone || '',
          email: data.email || '',
          authEmail: data.authEmail || '',
          password: data.password || '',
          status: data.status || 'approved',
          createdAt: data.createdAt || ''
        });
      });
      setAccounts(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to registered accounts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for password reset requests
  useEffect(() => {
    const qRequests = query(collection(db, 'password_reset_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qRequests, (snapshot) => {
      const list: PasswordResetRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: data.userId || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentClass: data.studentClass || '',
          grade: data.grade || '',
          password: data.password || '',
          createdAt: data.createdAt || '',
          status: data.status || 'pending'
        });
      });
      setResetRequests(list);
    }, (error) => {
      console.error("Error listening to password requests:", error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for profile update requests
  useEffect(() => {
    const qProRequests = query(collection(db, 'profile_update_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qProRequests, (snapshot) => {
      const list: ProfileUpdateRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: data.userId || '',
          currentName: data.currentName || '',
          currentClass: data.currentClass || '',
          currentGrade: data.currentGrade || '',
          currentDob: data.currentDob || '',
          currentPhone: data.currentPhone || '',
          requestedName: data.requestedName || '',
          requestedClass: data.requestedClass || '',
          requestedGrade: data.requestedGrade || '',
          requestedDob: data.requestedDob || '',
          requestedPhone: data.requestedPhone || '',
          createdAt: data.createdAt || '',
          status: data.status || 'pending'
        });
      });
      setProfileRequests(list);
    }, (error) => {
      console.error("Error listening to profile update requests:", error);
    });
    return () => unsubscribe();
  }, []);

  // Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<StudentAccount> | null>(null);

  const handleToggleStatus = async (account: StudentAccount) => {
    const nextStatus = account.status === 'blocked' ? 'approved' : 'blocked';
    const confirmMsg = account.status === 'blocked' 
      ? `Bạn có chắc chắn muốn bỏ chặn học sinh ${account.name}?` 
      : `Bạn có chắc chắn muốn chặn học sinh ${account.name}? Học sinh này sẽ lập tức bị thoát khỏi các hoạt động học tập.`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateDoc(doc(db, 'users', account.id), { status: nextStatus });
      } catch (error) {
        console.error("Error updating account status:", error);
        alert("Lỗi khi cập nhật trạng thái tài khoản.");
      }
    }
  };

  const handleDeleteAccount = async (account: StudentAccount) => {
    const confirmMsg = `Bạn có chắc chắn muốn XÓA HOÀN TOÀN tài khoản của học sinh ${account.name}?\nHành động này không thể hoàn tác!`;
    if (window.confirm(confirmMsg)) {
      try {
        // Try to delete Firebase Auth user on secondary app if credentials are known
        const studentEmail = account.authEmail || account.email;
        if (studentEmail && account.password) {
          try {
            const secondaryApp = initializeApp(firebaseConfig, "secondaryDeleter_" + Date.now());
            const secondaryAuth = getAuth(secondaryApp);
            
            // Try with actual plain password
            let authUser = null;
            try {
              const cred = await signInWithEmailAndPassword(secondaryAuth, studentEmail, account.password);
              authUser = cred.user;
            } catch (err1) {
              // Try with derived password as fallback
              try {
                const authPass = "StuAuth_" + studentEmail.toLowerCase().replace(/[^a-z0-9]/g, "_");
                const cred = await signInWithEmailAndPassword(secondaryAuth, studentEmail, authPass);
                authUser = cred.user;
              } catch (err2) {
                console.error("Could not sign into secondary auth to delete user:", err2);
              }
            }

            if (authUser) {
              await deleteUser(authUser);
              console.log("Successfully deleted Firebase Auth user");
            }
            await deleteApp(secondaryApp);
          } catch (authDeleteError) {
            console.error("Secondary app authentication deletion failed:", authDeleteError);
          }
        }

        await deleteDoc(doc(db, 'users', account.id));
        alert("Đã xóa tài khoản học sinh thành công!");
      } catch (error) {
        console.error("Error deleting student account:", error);
        alert("Lỗi khi xóa tài khoản.");
      }
    }
  };

  const handleSaveAccount = async () => {
    if (!currentAccount?.id || !currentAccount?.name || !currentAccount?.studentClass || !currentAccount?.grade) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Lớp, Khối).");
      return;
    }

    try {
      const updatedData = {
        name: currentAccount.name.trim().toUpperCase(),
        studentClass: currentAccount.studentClass.trim().toUpperCase(),
        grade: currentAccount.grade,
        dob: currentAccount.dob || '',
        phone: currentAccount.phone || '',
        status: currentAccount.status || 'approved',
        password: currentAccount.password || '',
      };

      await updateDoc(doc(db, 'users', currentAccount.id), updatedData);
      setIsEditing(false);
      setCurrentAccount(null);
      alert("Đã cập nhật thông tin tài khoản thành công!");
    } catch (error) {
      console.error("Error saving updated account:", error);
      alert("Lỗi khi lưu cập nhật thông tin tài khoản.");
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const queryLower = searchQuery.toLowerCase().trim();
    const matchSearch = 
      acc.name.toLowerCase().includes(queryLower) || 
      acc.studentClass.toLowerCase().includes(queryLower) || 
      acc.phone.includes(queryLower) || 
      (acc.email && acc.email.toLowerCase().includes(queryLower));
    
    const matchGrade = filterGrade === 'all' || acc.grade === filterGrade;
    
    const matchStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'blocked' && acc.status === 'blocked') || 
      (filterStatus === 'approved' && acc.status !== 'blocked');

    return matchSearch && matchGrade && matchStatus;
  });

  // Calculation of stats
  const totalCount = accounts.length;
  const blockedCount = accounts.filter(acc => acc.status === 'blocked').length;
  const activeCount = totalCount - blockedCount;

  return (
    <div className="space-y-6">
      {/* Header and Live Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng tài khoản</p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</h4>
          </div>
          <div className="p-4 bg-teal-500/10 text-teal-500 rounded-full">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tài khoản hoạt động</p>
            <h4 className="text-3xl font-black text-emerald-500 mt-1">{activeCount}</h4>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tài khoản bị chặn</p>
            <h4 className="text-3xl font-black text-rose-500 mt-1">{blockedCount}</h4>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sub tabs for Account view vs Password requests */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px mb-6">
        <button
          onClick={() => setActiveSubTab('list')}
          className={cn(
            "pb-3 px-6 font-bold text-sm tracking-tight border-b-2 transition-all relative flex items-center gap-2",
            activeSubTab === 'list'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-755 dark:hover:text-slate-350"
          )}
        >
          <Users className="w-4 h-4" />
          Danh sách tài khoản ({accounts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={cn(
            "pb-3 px-6 font-bold text-sm tracking-tight border-b-2 transition-all relative flex items-center gap-2",
            activeSubTab === 'requests'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-755 dark:hover:text-slate-350"
          )}
        >
          <Key className="w-4 h-4" />
          Yêu cầu cấp lại mật khẩu
          {resetRequests.filter(req => req.status === 'pending').length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none">
              {resetRequests.filter(req => req.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('profileRequests')}
          className={cn(
            "pb-3 px-6 font-bold text-sm tracking-tight border-b-2 transition-all relative flex items-center gap-2",
            activeSubTab === 'profileRequests'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-755 dark:hover:text-slate-350"
          )}
        >
          <Edit2 className="w-4 h-4" />
          Yêu cầu đổi thông tin
          {profileRequests.filter(req => req.status === 'pending').length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white leading-none">
              {profileRequests.filter(req => req.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'list' ? (
        <>
          {/* Control Panel / Filter & Search bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, lớp, SĐT hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-705 bg-slate-50 dark:bg-slate-800/50 outline-none text-slate-900 dark:text-white focus:border-teal-500 focus:bg-white dark:focus:bg-transparent transition-all"
              />
            </div>

            <div className="flex gap-4 w-full md:w-auto justify-end">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value as any)}
                className="px-4 py-2.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-705 outline-none focus:border-teal-500 text-sm"
              >
                <option value="all">Tất cả Khối lớp</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-705 outline-none focus:border-teal-500 text-sm"
              >
                <option value="all">Tất cả Trạng thái</option>
                <option value="approved">Đang hoạt động</option>
                <option value="blocked">Bị chặn</option>
              </select>
            </div>
          </div>

          {/* Table Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Học sinh</th>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Khối lớp</th>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Liên hệ</th>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Thông tin khác</th>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Trạng thái</th>
                    <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Đang tải dữ liệu học sinh...</td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">Không tìm thấy tài khoản nào phù hợp.</td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        {/* User display */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white uppercase">{acc.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">{acc.id}</div>
                        </td>
                        
                        {/* Grade and class */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Lớp {acc.studentClass}</span>
                          <div className="text-xs text-slate-400">Khối {acc.grade || 'Chưa rõ'}</div>
                        </td>

                        {/* Contacts: Phone and Email */}
                        <td className="px-6 py-4 space-y-1">
                          {acc.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{acc.phone}</span>
                            </div>
                          )}
                          {acc.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[180px]">{acc.email}</span>
                            </div>
                          )}
                        </td>

                        {/* DOB and Registration date */}
                        <td className="px-6 py-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {acc.dob && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ngày sinh: {acc.dob.split('-').reverse().join('/')}</span>
                            </div>
                          )}
                          {acc.createdAt && (
                            <p className="text-[10px] text-slate-400">
                              ĐK: {new Date(acc.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold inline-block",
                            acc.status === 'blocked' 
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          )}>
                            {acc.status === 'blocked' ? 'Bị Chặn' : 'Đang Hoạt Động'}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setCurrentAccount({ ...acc });
                                setIsEditing(true);
                              }}
                              className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500 hover:text-white rounded-lg transition-colors"
                              title="Sửa thông tin tài khoản"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Block/Unblock Button */}
                            <button
                              onClick={() => handleToggleStatus(acc)}
                              className={cn(
                                "p-2 rounded-lg transition-colors border",
                                acc.status === 'blocked'
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                              )}
                              title={acc.status === 'blocked' ? "Mở khóa tài khoản" : "Chặn tài khoản"}
                            >
                              <Ban className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteAccount(acc)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-rose-500/10 hover:border-red-500/30 rounded-lg transition-colors"
                              title="Xóa tài khoản vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeSubTab === 'requests' ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Học sinh yêu cầu</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Lớp</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Email & Số điện thoại</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Mật khẩu hiện tại</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Thời gian gửi</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs text-center">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {resetRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-550 dark:text-slate-400 italic">Hiện không có yêu cầu đổi mật khẩu nào chưa giải quyết.</td>
                  </tr>
                ) : (
                  resetRequests.map((req) => {
                    const matchingUser = accounts.find(a => a.id === req.userId);
                    const currentPasswordStr = matchingUser?.password || req.password || 'Chưa rõ';
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white uppercase">{req.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">UID: {req.userId}</div>
                        </td>

                        {/* Class details */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-705 dark:text-slate-300">Lớp {req.studentClass}</span>
                          <div className="text-xs text-slate-400">Khối {req.grade}</div>
                        </td>

                        {/* Contacts */}
                        <td className="px-6 py-4 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.email || '--'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-620 dark:text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.phone || '--'}</span>
                          </div>
                        </td>

                        {/* Raw password display */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-mono font-bold">
                              {currentPasswordStr}
                            </span>
                          </div>
                        </td>

                        {/* Sending time */}
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                          {req.createdAt ? (
                            <>
                              <div>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(req.createdAt).toLocaleTimeString('vi-VN')}
                              </div>
                            </>
                          ) : '--/--'}
                        </td>

                        {/* Action controllers */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Cấp lại mật khẩu trực tiếp */}
                            <button
                              onClick={() => {
                                if (matchingUser) {
                                  setCurrentAccount({ ...matchingUser });
                                  setIsEditing(true);
                                } else {
                                  alert("Không tìm thấy học sinh tương ứng trên danh sách.");
                                }
                              }}
                              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Xem / Đổi mật khẩu
                            </button>

                            {/* Mark resolved */}
                            <button
                              onClick={async () => {
                                if (window.confirm("Đánh dấu yêu cầu của học sinh " + req.name + " đã được xử lý xong?")) {
                                  try {
                                    await deleteDoc(doc(db, 'password_reset_requests', req.id));
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Giải quyết xong
                            </button>

                            {/* Dismiss Request */}
                            <button
                              onClick={async () => {
                                if (window.confirm("Bạn muốn xóa yêu cầu này ra khỏi danh sách chờ?")) {
                                  try {
                                    await deleteDoc(doc(db, 'password_reset_requests', req.id));
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                              title="Xóa yêu cầu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Học sinh yêu cầu</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Thông tin hiện tại</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Thông tin mới đề xuất</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">Thời gian gửi</th>
                  <th className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs text-center">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {profileRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-550 dark:text-slate-400 italic">Hiện không có yêu cầu thay đổi thông tin cá nhân nào chưa giải quyết.</td>
                  </tr>
                ) : (
                  profileRequests.map((req) => {
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        {/* Student requested */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white uppercase">{req.currentName || req.requestedName}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">UID: {req.userId}</div>
                        </td>

                        {/* Current info */}
                        <td className="px-6 py-4 text-xs space-y-1 text-slate-650 dark:text-slate-300">
                          <div><span className="font-semibold text-slate-400">Họ tên:</span> {req.currentName || '--'}</div>
                          <div><span className="font-semibold text-slate-400">Lớp:</span> {req.currentClass ? `Lớp ${req.currentClass}` : '--'} (Khối {req.currentGrade || 'Chưa rõ'})</div>
                          <div><span className="font-semibold text-slate-400">SDT:</span> {req.currentPhone || '--'}</div>
                          <div><span className="font-semibold text-slate-400">Ngày sinh:</span> {req.currentDob ? req.currentDob.split('-').reverse().join('/') : '--'}</div>
                        </td>

                        {/* Requested change details */}
                        <td className="px-6 py-4 text-xs space-y-1 bg-teal-500/5 dark:bg-teal-500/10">
                          <div>
                            <span className="font-bold text-slate-500 dark:text-slate-400">Họ tên mới:</span>{' '}
                            <span className={cn(req.requestedName !== req.currentName ? "text-emerald-500 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-350")}>
                              {req.requestedName}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-slate-400">Lớp mới:</span>{' '}
                            <span className={cn(req.requestedClass !== req.currentClass || req.requestedGrade !== req.currentGrade ? "text-emerald-500 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-350")}>
                              {req.requestedClass ? `Lớp ${req.requestedClass}` : '--'} (Khối {req.requestedGrade})
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-slate-400">SĐT mới:</span>{' '}
                            <span className={cn(req.requestedPhone !== req.currentPhone ? "text-emerald-500 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-350")}>
                              {req.requestedPhone}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-slate-400">Ngày sinh mới:</span>{' '}
                            <span className={cn(req.requestedDob !== req.currentDob ? "text-emerald-500 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-350")}>
                              {req.requestedDob ? req.requestedDob.split('-').reverse().join('/') : '--'}
                            </span>
                          </div>
                        </td>

                        {/* Request date */}
                        <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400">
                          {req.createdAt ? (
                            <>
                              <div>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(req.createdAt).toLocaleTimeString('vi-VN')}
                              </div>
                            </>
                          ) : '--/--'}
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Phê duyệt */}
                            <button
                              onClick={async () => {
                                if (window.confirm(`Xác nhận phê duyệt thay đổi thông tin cá nhân cho học sinh ${req.requestedName}?`)) {
                                  try {
                                    // 1. Update primary user doc in Firestore users collection
                                    await updateDoc(doc(db, 'users', req.userId), {
                                      name: req.requestedName,
                                      studentClass: req.requestedClass,
                                      grade: req.requestedGrade,
                                      dob: req.requestedDob,
                                      phone: req.requestedPhone
                                    });

                                    // 2. Delete the profile_update_requests document
                                    await deleteDoc(doc(db, 'profile_update_requests', req.id));
                                    alert(`Đã duyệt thông tin mới thành công sản cho học sinh ${req.requestedName}.`);
                                  } catch (err: any) {
                                    console.error(err);
                                    alert("Đã xảy ra lỗi khi duyệt: " + err.message);
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Duyệt thay đổi
                            </button>

                            {/* Từ chối */}
                            <button
                              onClick={async () => {
                                if (window.confirm(`Từ chối yêu cầu đổi thông tin cá nhân của học sinh ${req.requestedName}?`)) {
                                  try {
                                    await deleteDoc(doc(db, 'profile_update_requests', req.id));
                                  } catch (err: any) {
                                    console.error(err);
                                    alert("Lỗi: " + err.message);
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                              title="Từ chối"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditing && currentAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-teal-400" />
                Cập nhật thông tin
              </h3>
              <button 
                onClick={() => { setIsEditing(false); setCurrentAccount(null); setShowPassword(false); }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  value={currentAccount.name || ''}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, name: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Lớp</label>
                  <input 
                    type="text" 
                    value={currentAccount.studentClass || ''}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, studentClass: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Khối lớp</label>
                  <select 
                    value={currentAccount.grade || ''}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, grade: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500"
                  >
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={currentAccount.phone || ''}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Mật khẩu tài khoản (Có thể xem & sửa)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={currentAccount.password || ''}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-3 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-mono"
                    placeholder="Chưa cấu hình mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Ngày sinh</label>
                <input 
                  type="date" 
                  value={currentAccount.dob || ''}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, dob: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Trạng thái quyền</label>
                <select 
                  value={currentAccount.status || 'approved'}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-teal-500"
                >
                  <option value="approved">Đang hoạt động (Kích hoạt)</option>
                  <option value="blocked">Bị chặn truy cập (Khóa tài khoản)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { setIsEditing(false); setCurrentAccount(null); setShowPassword(false); }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveAccount}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
