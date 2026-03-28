import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const AnnouncementForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = auth.currentUser?.uid;
    if (!userId || !title.trim() || !content.trim()) return;

    await addDoc(collection(db, 'announcements'), {
      title,
      content,
      authorId: userId,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Tạo thông báo mới</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề"
        className="w-full border rounded p-2 mb-2"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nội dung"
        className="w-full border rounded p-2 mb-2"
        rows={4}
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Đăng thông báo
      </button>
    </form>
  );
};
