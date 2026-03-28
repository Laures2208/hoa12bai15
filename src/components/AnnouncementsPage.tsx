import React from 'react';
import { AnnouncementList } from './AnnouncementList';
import { AnnouncementForm } from './AnnouncementForm';
import { auth } from '../firebase';

export const AnnouncementsPage: React.FC = () => {
  const isAdmin = auth.currentUser?.email === "mainamanh22082008@gmail.com";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Thông báo</h1>
      {isAdmin && <AnnouncementForm />}
      <AnnouncementList isAdmin={isAdmin} />
    </div>
  );
};
