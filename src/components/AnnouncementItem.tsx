import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Announcement, AnnouncementComment, AnnouncementLike } from '../types';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';

interface AnnouncementItemProps {
  announcement: Announcement;
  isAdmin: boolean;
}

export const AnnouncementItem: React.FC<AnnouncementItemProps> = ({ announcement, isAdmin }) => {
  const [likes, setLikes] = useState<AnnouncementLike[]>([]);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const likesQuery = query(collection(db, 'announcements', announcement.id, 'likes'));
    const commentsQuery = query(collection(db, 'announcements', announcement.id, 'comments'));

    const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
      setLikes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnnouncementLike)));
    });

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnnouncementComment)));
    });

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [announcement.id]);

  const handleLike = async () => {
    const authorId = auth.currentUser?.uid;
    if (!authorId) return;

    const existingLike = likes.find((l) => l.authorId === authorId);
    if (existingLike) {
      await deleteDoc(doc(db, 'announcements', announcement.id, 'likes', existingLike.id));
    } else {
      await addDoc(collection(db, 'announcements', announcement.id, 'likes'), {
        announcementId: announcement.id,
        authorId,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleComment = async () => {
    const authorId = auth.currentUser?.uid;
    if (!authorId || !newComment.trim()) return;

    await addDoc(collection(db, 'announcements', announcement.id, 'comments'), {
      announcementId: announcement.id,
      authorId,
      content: newComment,
      createdAt: new Date().toISOString(),
    });
    setNewComment('');
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'announcements', announcement.id));
  };

  const isLiked = likes.some((l) => l.authorId === auth.currentUser?.uid);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
      <p className="text-gray-700 mb-4">{announcement.content}</p>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleLike} className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          {likes.length}
        </button>
        <div className="flex items-center gap-1 text-gray-500">
          <MessageSquare size={20} />
          {comments.length}
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="text-red-500 ml-auto">
            <Trash2 size={20} />
          </button>
        )}
      </div>
      <div className="border-t pt-4">
        {comments.map((comment) => (
          <p key={comment.id} className="text-sm text-gray-600 mb-1">
            <strong>{comment.authorId.substring(0, 5)}:</strong> {comment.content}
          </p>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận..."
            className="flex-grow border rounded p-2"
          />
          <button onClick={handleComment} className="bg-blue-500 text-white px-4 py-2 rounded">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
