import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const checkAndResetGatekeeper = async () => {
  try {
    const configRef = doc(db, 'system_settings', 'config');
    const configDoc = await getDoc(configRef);
    
    const today = new Date();
    // Use local timezone date string YYYY-MM-DD
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    if (configDoc.exists()) {
      const data = configDoc.data();
      if (data.lastResetDate !== todayStr) {
        // Reset needed: only turn off autoApprove, keep existing passcode
        await setDoc(configRef, {
          autoApprove: false,
          lastResetDate: todayStr
        }, { merge: true });
        return { autoApprove: false, passcode: data.passcode || '' };
      }
      return { autoApprove: data.autoApprove ?? true, passcode: data.passcode || '' };
    } else {
      // Initialize if not exists
      const newPasscode = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(configRef, {
        autoApprove: false,
        passcode: newPasscode,
        lastResetDate: todayStr
      });
      return { autoApprove: false, passcode: newPasscode };
    }
  } catch (error) {
    console.error("Error checking and resetting gatekeeper:", error);
    return null;
  }
};
