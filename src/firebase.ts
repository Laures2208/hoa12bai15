import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCGukcncbnQUKHleypF0I777JJku0dbNJo',
  authDomain: 'hoa12bai15.firebaseapp.com',
  databaseURL: 'https://hoa12bai15-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'hoa12bai15',
  storageBucket: 'hoa12bai15.firebasestorage.app',
  messagingSenderId: '366522898623',
  appId: '1:366522898623:web:1af99c1e832785ff890e0a'
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
