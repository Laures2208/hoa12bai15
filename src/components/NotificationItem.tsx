import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Post, PostComment, PostLike } from '../types';

interface NotificationItemProps {
  post: Post;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ post }) => {
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const likesQuery = query(collection(db, 'posts', post.id, 'likes'));
    const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
      setLikes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostLike)));
    });

    const commentsQuery = query(collection(db, 'posts', post.id, 'comments'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment)));
    });

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [post.id]);

  const handleLike = async () => {
    if (!auth.currentUser) return;
    const existingLike = likes.find(l => l.authorId === auth.currentUser?.uid);
    if (existingLike) {
      await deleteDoc(doc(db, 'posts', post.id, 'likes', existingLike.id));
    } else {
      await addDoc(collection(db, 'posts', post.id, 'likes'), {
        postId: post.id,
        authorId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleComment = async () => {
    if (!auth.currentUser || !newComment.trim()) return;
    await addDoc(collection(db, 'posts', post.id, 'comments'), {
      postId: post.id,
      authorId: auth.currentUser.uid,
      content: newComment,
      createdAt: new Date().toISOString()
    });
    setNewComment('');
  };

  return (
    <div className="border p-4 mb-4 rounded shadow">
      <h3 className="font-bold text-lg">{post.title}</h3>
      <p className="text-gray-700">{post.content}</p>
      <div className="mt-2 flex items-center gap-4">
        <button onClick={handleLike} className={likes.some(l => l.authorId === auth.currentUser?.uid) ? 'text-blue-500' : 'text-gray-500'}>
          Like ({likes.length})
        </button>
        <span>Comments ({comments.length})</span>
      </div>
      <div className="mt-4">
        {comments.map(comment => (
          <p key={comment.id} className="text-sm border-b py-1">{comment.content}</p>
        ))}
        <div className="flex gap-2 mt-2">
          <input 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            className="border p-1 flex-grow"
            placeholder="Add a comment..."
          />
          <button onClick={handleComment} className="bg-blue-500 text-white p-1 rounded">Post</button>
        </div>
      </div>
    </div>
  );
};
