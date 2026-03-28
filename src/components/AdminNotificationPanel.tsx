import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const AdminNotificationPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePost = async () => {
    if (!auth.currentUser || !title.trim() || !content.trim()) return;
    await addDoc(collection(db, 'posts'), {
      title,
      content,
      authorId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });
    setTitle('');
    setContent('');
  };

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-100">
      <h2 className="text-xl font-bold mb-2">Create Notification</h2>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        className="border p-2 w-full mb-2"
        placeholder="Title"
      />
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        className="border p-2 w-full mb-2"
        placeholder="Content"
      />
      <button onClick={handlePost} className="bg-green-500 text-white p-2 rounded">Post</button>
    </div>
  );
};
