import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { applyAccountLanguage, registerLanguagePersistence } from '../lib/i18n';
import {
  accountLanguageFields,
  clearSessionLanguage,
  preferredLanguage,
  rememberSessionLanguage,
} from '../lib/userLanguage';

/** Reads the account language after sign-in and writes it back only when the user changes it. */
export function LanguageAccountSync(): null {
  const { user } = useAuth();

  useEffect(() => {
    return registerLanguagePersistence((next) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      rememberSessionLanguage(uid, next);
      void setDoc(doc(db, 'users', uid), accountLanguageFields(next), { merge: true }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!user?.id) {
      clearSessionLanguage();
      return;
    }
    const next = preferredLanguage(user.id, user.uiLanguage ?? null);
    if (next) applyAccountLanguage(next);
  }, [user?.id, user?.uiLanguage]);

  return null;
}
