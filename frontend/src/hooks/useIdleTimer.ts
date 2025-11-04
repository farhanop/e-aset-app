// src/hooks/useIdleTimer.ts

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook untuk mendeteksi inaktivitas pengguna dan melakukan logout otomatis.
 * @param timeout Durasi timeout dalam milidetik (ms).
 */
export const useIdleTimer = (timeout: number) => {
  const { logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi untuk mereset timer
  const resetTimer = () => {
    // Hapus timer yang ada
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Set timer baru
    timerRef.current = setTimeout(() => {
      // Jika timer selesai, panggil fungsi logout
      logout('Sesi Anda telah berakhir karena tidak ada aktivitas.');
    }, timeout);
  };

  useEffect(() => {
    // Daftar event yang dianggap sebagai aktivitas pengguna
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
    ];

    // Fungsi event listener yang akan mereset timer
    const handleActivity = () => {
      resetTimer();
    };

    // Tambahkan event listener untuk semua event di atas
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Mulai timer saat komponen pertama kali dimuat
    resetTimer();

    // Fungsi cleanup: hapus semua event listener saat komponen di-unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [logout, timeout]); // Bergantung pada fungsi logout dan durasi timeout
};