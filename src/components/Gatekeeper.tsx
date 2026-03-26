import React, { useState, useEffect } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Users, Ban, Check, Trash2, Key } from 'lucide-react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { checkAndResetGatekeeper } from '../utils/gatekeeperHelper';

interface StudentSession {
  id: string;
  name: string;
  studentClass: string;
  status: 'waiting' | 'approved' | 'blocked';
  lastActive: number;
}

export const Gatekeeper = () => {
  const [students, setStudents] = useState<StudentSession[]>([]);
  const [autoApprove, setAutoApprove] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check and reset if it's a new day
    checkAndResetGatekeeper();

    // Set up interval to check every minute
    const intervalId = setInterval(() => {
      checkAndResetGatekeeper();
    }, 60000);

    // Fetch settings
    const unsubSettings = onSnapshot(doc(db, 'system_settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAutoApprove(data.autoApprove ?? true);
        setPasscode(data.passcode || '');
      }
    });

    // Fetch students
    const q = query(collection(db, 'student_sessions'));
    const unsubStudents = onSnapshot(q, (snapshot) => {
      const list: StudentSession[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as StudentSession);
      });
      // Sort: waiting first, then approved, then blocked
      list.sort((a, b) => {
        const order = { waiting: 0, approved: 1, blocked: 2 };
        return order[a.status] - order[b.status];
      });
      setStudents(list);
    });

    return () => {
      clearInterval(intervalId);
      unsubSettings();
      unsubStudents();
    };
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'system_settings', 'config'), {
        autoApprove,
        passcode
      }, { merge: true });
      alert('Đã lưu cài đặt Cổng An Ninh!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Lỗi khi lưu cài đặt.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStudentStatus = async (id: string, name: string, status: 'approved' | 'blocked') => {
    if (status === 'blocked') {
      if (!window.confirm(`Bạn có chắc chắn muốn CHẶN học sinh ${name}? Học sinh này sẽ bị out khỏi lớp ngay lập tức.`)) {
        return;
      }
    }
    try {
      await updateDoc(doc(db, 'student_sessions', id), { status });
      if (status === 'blocked') alert(`Đã chặn học sinh ${name} thành công!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Lỗi khi cập nhật trạng thái học sinh.');
    }
  };

  const kickStudent = async (student: StudentSession) => {
    if (confirm(`Bạn có chắc chắn muốn đuổi học sinh ${student.name} ra khỏi lớp?\n\nHành động này sẽ XOÁ TOÀN BỘ dữ liệu của học sinh này (điểm, bài đã làm, dữ liệu trên bảng xếp hạng, v.v.).\n\nKhông thể hoàn tác!`)) {
      try {
        // 1. Delete session
        await deleteDoc(doc(db, 'student_sessions', student.id));
        
        // 2. Delete all results for this student
        const q = query(
          collection(db, 'results'),
          where('studentName', '==', student.name),
          where('studentClass', '==', student.studentClass)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // Firestore batch has a limit of 500 operations
          const batches = [];
          let currentBatch = writeBatch(db);
          let operationCount = 0;

          snapshot.forEach(doc => {
            currentBatch.delete(doc.ref);
            operationCount++;

            if (operationCount === 500) {
              batches.push(currentBatch.commit());
              currentBatch = writeBatch(db);
              operationCount = 0;
            }
          });

          if (operationCount > 0) {
            batches.push(currentBatch.commit());
          }

          await Promise.all(batches);
        }
        
        // 3. Delete from SQLite database
        try {
          await fetch(`/api/admin/students/${encodeURIComponent(student.name)}/${encodeURIComponent(student.studentClass)}`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.error("Error deleting from SQLite:", err);
        }
        
        alert(`Đã xoá học sinh ${student.name} và toàn bộ dữ liệu liên quan.`);
      } catch (error) {
        console.error("Error kicking student and deleting data:", error);
        alert('Có lỗi xảy ra khi xoá dữ liệu học sinh.');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <div className="p-3 bg-rose-500/20 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Cổng An Ninh & Quản lý Học sinh</h2>
          <p className="text-slate-400 text-sm">Kiểm soát quyền truy cập và quản lý lớp học</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              Chế độ Duyệt
            </h3>
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
              <span className="text-slate-300 font-medium">Duyệt tự động</span>
              <button 
                onClick={() => setAutoApprove(!autoApprove)}
                className={cn("transition-colors", autoApprove ? "text-emerald-500" : "text-slate-600")}
              >
                {autoApprove ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {autoApprove ? 'Học sinh đăng ký sẽ được vào lớp ngay lập tức.' : 'Học sinh phải đợi Admin duyệt mới được vào lớp.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-rose-500" />
              Mã Passcode (Vào nhanh)
            </h3>
            <input 
              type="text" 
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập 4 số..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 px-4 text-white text-center text-2xl tracking-widest font-mono focus:border-rose-500 outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Học sinh nhập đúng mã này sẽ được vào lớp ngay (bỏ qua chờ duyệt).
            </p>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 mt-auto"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
          </button>
        </div>

        <div className="col-span-1 md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-500" />
            Danh sách Học sinh ({students.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px]">
            {students.length === 0 ? (
              <div className="text-center py-12 text-slate-500 italic">Chưa có học sinh nào đăng ký.</div>
            ) : (
              students.map(student => (
                <div key={student.id} className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  student.status === 'waiting' ? "bg-amber-500/10 border-amber-500/30" :
                  student.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/30" :
                  "bg-rose-500/10 border-rose-500/30"
                )}>
                  <div>
                    <div className="font-bold text-white text-lg">{student.name}</div>
                    <div className="text-sm text-slate-400">Lớp: {student.studentClass}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === 'waiting' && (
                      <>
                        <button 
                          onClick={() => updateStudentStatus(student.id, student.name, 'approved')}
                          className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                          title="Duyệt"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateStudentStatus(student.id, student.name, 'blocked')}
                          className="p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                          title="Chặn"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {student.status === 'approved' && (
                      <button 
                        onClick={() => updateStudentStatus(student.id, student.name, 'blocked')}
                        className="p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                        title="Chặn"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    )}
                    {student.status === 'blocked' && (
                      <button 
                        onClick={() => updateStudentStatus(student.id, student.name, 'approved')}
                        className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                        title="Bỏ chặn"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => kickStudent(student)}
                      className="p-2 bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors ml-2"
                      title="Đuổi khỏi lớp và xoá dữ liệu"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
