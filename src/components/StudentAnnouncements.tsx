import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { MessageSquare, ThumbsUp, Send, User, Trash2, ImagePlus, Loader2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
    tenantId: string | null | undefined;
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

interface Comment {
  id: string;
  announcementId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

interface StudentAnnouncementsProps {
  studentInfo: { name: string; studentClass: string; grade?: string };
  isAdmin?: boolean;
  onEdit?: (announcement: Announcement) => void;
}

export const StudentAnnouncements: React.FC<StudentAnnouncementsProps> = ({ studentInfo, isAdmin, onEdit }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);

  if (firestoreError) {
    throw firestoreError;
  }

  const studentId = `${studentInfo.name}_${studentInfo.studentClass}`;

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      // Sort: Pinned first, then by date
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setAnnouncements(list);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      } catch (e) {
        setFirestoreError(e instanceof Error ? e : new Error(String(e)));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'announcement_comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsMap: Record<string, Comment[]> = {};
      snapshot.forEach(doc => {
        const comment = { id: doc.id, ...doc.data() } as Comment;
        if (!commentsMap[comment.announcementId]) {
          commentsMap[comment.announcementId] = [];
        }
        commentsMap[comment.announcementId].push(comment);
      });
      setComments(commentsMap);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'announcement_comments');
      } catch (e) {
        setFirestoreError(e instanceof Error ? e : new Error(String(e)));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (announcementId: string, currentLikes: string[] = []) => {
    const isLiked = currentLikes.includes(studentId);
    const ref = doc(db, 'announcements', announcementId);
    
    try {
      if (isLiked) {
        await updateDoc(ref, {
          likes: arrayRemove(studentId)
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'announcements/' + announcementId));
      } else {
        await updateDoc(ref, {
          likes: arrayUnion(studentId)
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'announcements/' + announcementId));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error updating like:", error);
    }
  };

  const handleCommentSubmit = async (announcementId: string) => {
    const content = newComments[announcementId]?.trim();
    if (!content) return;

    try {
      await addDoc(collection(db, 'announcement_comments'), {
        announcementId,
        authorName: isAdmin ? 'Giáo viên' : studentInfo.name,
        content,
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'announcement_comments'));
      
      setNewComments(prev => ({ ...prev, [announcementId]: '' }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        await deleteDoc(doc(db, 'announcement_comments', commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Lỗi khi xóa bình luận.");
      }
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!isAdmin) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await deleteDoc(doc(db, 'announcements', announcementId));
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Lỗi khi xóa bài đăng.");
      }
    }
  };

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      await addDoc(collection(db, 'announcements'), {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        imageUrl: newPostImageUrl.trim(),
        author: studentInfo.name,
        createdAt: serverTimestamp(),
        likes: [],
        isPinned: false
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'announcements'));
      
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUrl('');
      setShowImageInput(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('FirestoreErrorInfo')) {
        throw error;
      }
      console.error("Error creating post:", error);
      alert("Lỗi khi đăng bài.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Chưa có thông báo nào từ Giáo viên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Đăng bài mới</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Tiêu đề bài đăng..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Nội dung bài đăng..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
            />
            {showImageInput && (
              <input
                type="text"
                value={newPostImageUrl}
                onChange={(e) => setNewPostImageUrl(e.target.value)}
                placeholder="Nhập URL hình ảnh..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            )}
            {newPostImageUrl && (
              <div className="relative inline-block">
                <img src={newPostImageUrl} alt="Preview" className="h-32 rounded-lg border border-slate-700 object-cover" />
                <button
                  onClick={() => setNewPostImageUrl('')}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-700"
              >
                <ImagePlus className="w-4 h-4" />
                Thêm ảnh
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}

      {announcements.map(announcement => {
        const isLiked = announcement.likes?.includes(studentId);
        const announcementComments = comments[announcement.id] || [];
        const isExpanded = expandedComments[announcement.id];

        return (
          <div key={announcement.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {announcement.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white leading-tight">{announcement.title}</h3>
                      {announcement.isPinned && (
                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] font-bold rounded-full uppercase">Ghim</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="font-medium text-teal-400">{announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.createdAt?.toDate ? new Date(announcement.createdAt.toDate()).toLocaleString('vi-VN') : 'Vừa xong'}</span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(announcement)}
                        className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition-colors"
                        title="Sửa bài đăng"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      title="Xóa bài đăng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {announcement.imageUrl && (
                <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-auto rounded-lg mb-4" referrerPolicy="no-referrer" />
              )}

              <div className="prose prose-invert prose-teal max-w-none mb-6">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {announcement.content}
                </ReactMarkdown>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => handleLike(announcement.id, announcement.likes)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium",
                    isLiked 
                      ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30" 
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                  )}
                >
                  <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
                  {announcement.likes?.length || 0} Thích
                </button>
                <button
                  onClick={() => setExpandedComments(prev => ({ ...prev, [announcement.id]: !prev[announcement.id] }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  {announcementComments.length} Bình luận
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="bg-slate-900/50 p-6 border-t border-slate-700/50">
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {announcementComments.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  ) : (
                    announcementComments.map(comment => (
                      <div key={comment.id} className="flex gap-3 group relative">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          comment.authorName === 'Giáo viên' 
                            ? "bg-teal-500 text-white" 
                            : "bg-slate-700 text-slate-300"
                        )}>
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className={cn(
                          "rounded-2xl rounded-tl-none px-4 py-2 text-sm",
                          comment.authorName === 'Giáo viên'
                            ? "bg-teal-500/10 border border-teal-500/20"
                            : "bg-slate-800"
                        )}>
                          <div className={cn(
                            "font-bold mb-0.5",
                            comment.authorName === 'Giáo viên' ? "text-teal-400" : "text-slate-300"
                          )}>
                            {comment.authorName}
                          </div>
                          <div className="text-slate-200">{comment.content}</div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute right-0 top-2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa bình luận"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComments[announcement.id] || ''}
                    onChange={(e) => setNewComments(prev => ({ ...prev, [announcement.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleCommentSubmit(announcement.id);
                      }
                    }}
                    placeholder="Viết bình luận..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    onClick={() => handleCommentSubmit(announcement.id)}
                    disabled={!newComments[announcement.id]?.trim()}
                    className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
