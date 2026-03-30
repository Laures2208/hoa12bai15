import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Edit2, Trash2, X, Save, MessageSquare, ThumbsUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { StudentAnnouncements } from './StudentAnnouncements';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
  likes: string[];
  imageUrl?: string;
  isPinned?: boolean;
}

export const AdminAnnouncements: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);

  const handleSave = async () => {
    if (!currentAnnouncement?.title || !currentAnnouncement?.content) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      const data = {
        title: currentAnnouncement.title,
        content: currentAnnouncement.content,
        imageUrl: currentAnnouncement.imageUrl || '',
        isPinned: !!currentAnnouncement.isPinned,
      };

      if (currentAnnouncement.id) {
        // Update
        await updateDoc(doc(db, 'announcements', currentAnnouncement.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create
        await addDoc(collection(db, 'announcements'), {
          ...data,
          author: 'Giáo viên',
          createdAt: serverTimestamp(),
          likes: []
        });
      }
      setIsEditing(false);
      setCurrentAnnouncement(null);
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Lỗi khi lưu thông báo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Lỗi khi xóa thông báo.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Thông báo</h2>
        <button
          onClick={() => {
            setCurrentAnnouncement({ title: '', content: '' });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold"
        >
          <Plus className="w-4 h-4" />
          Tạo thông báo mới
        </button>
      </div>

      {isEditing && currentAnnouncement ? (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {currentAnnouncement.id ? 'Sửa thông báo' : 'Tạo thông báo mới'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={currentAnnouncement.title || ''}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                placeholder="Nhập tiêu đề thông báo..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">URL Hình ảnh (tùy chọn)</label>
              <input
                type="text"
                value={currentAnnouncement.imageUrl || ''}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, imageUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                placeholder="Nhập URL hình ảnh..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!currentAnnouncement.isPinned}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, isPinned: e.target.checked })}
                className="w-4 h-4 text-teal-500 bg-slate-900 border-slate-700 rounded focus:ring-teal-500"
              />
              <label className="text-sm font-medium text-slate-400">Ghim thông báo lên đầu</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nội dung (Hỗ trợ Markdown & LaTeX)</label>
              <textarea
                value={currentAnnouncement.content || ''}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, content: e.target.value })}
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm"
                placeholder="Nhập nội dung thông báo..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold"
              >
                <Save className="w-4 h-4" />
                Lưu thông báo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <StudentAnnouncements 
          studentInfo={{ name: 'Giáo viên', studentClass: 'Admin' }} 
          isAdmin={true} 
          onEdit={(announcement) => {
            setCurrentAnnouncement(announcement);
            setIsEditing(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
};
