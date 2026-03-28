import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Announcement } from '../types';
import { AnnouncementItem } from './AnnouncementItem';

interface AnnouncementListProps {
  isAdmin: boolean;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({ isAdmin }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Announcement)));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-6">Thông báo</h2>
      {announcements.map((announcement) => (
        <AnnouncementItem key={announcement.id} announcement={announcement} isAdmin={isAdmin} />
      ))}
    </div>
  );
};
