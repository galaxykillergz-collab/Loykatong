import React, { useEffect } from 'react';
import { X, CheckCircle2, Info } from 'lucide-react';
import { firebaseConfig, isFirebaseConfigured } from '@/src/firebase/config';
import type { StorageMode } from '@/src/services/krathongService';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  storageMode: StorageMode;
  onChangeMode: (mode: StorageMode) => void;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  storageMode,
  onChangeMode,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040714]/80 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="firebase-guide-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#131C3B] border border-white/15 p-6 sm:p-8 text-[#FFF8F0] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="firebase-guide-title"
              className="font-display text-xl font-semibold text-[#FFF8F0]"
            >
              การเชื่อมต่อ Firebase Firestore &amp; โหมดตัวอย่าง
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1">
              สลับโหมดใช้งานหรือตรวจสอบตำแหน่งตั้งค่า Firebase Config และ Security Rules
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดคู่มือ"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="rounded-2xl bg-[#0D142E] border border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isFirebaseConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#6EE7B7] shrink-0" />
                <span className="text-[#6EE7B7]">
                  ตรวจพบการตั้งค่า Firebase Project ({firebaseConfig.projectId}) แล้ว
                </span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-[#FDE68A] shrink-0" />
                <span className="text-[#FDE68A]">
                  ยังไม่ได้ตั้งค่า Firebase จริง — กำลังใช้โหมดตัวอย่าง (Local Storage)
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!isFirebaseConfigured}
              onClick={() => onChangeMode('firebase')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors ${
                storageMode === 'firebase'
                  ? 'bg-[#F6C56E] border-[#F6C56E] text-[#0B1024]'
                  : 'bg-[#141D3D] border-white/15 text-[#CBD5E1] hover:text-white disabled:opacity-40'
              }`}
            >
              ใช้ Firebase Firestore (Real-time)
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('demo')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors ${
                storageMode === 'demo'
                  ? 'bg-[#F497B6] border-[#F497B6] text-[#0B1024]'
                  : 'bg-[#141D3D] border-white/15 text-[#CBD5E1] hover:text-white'
              }`}
            >
              โหมดตัวอย่าง (Demo / Local)
            </button>
          </div>
        </div>

        {/* Guide Steps */}
        <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-display text-sm font-semibold text-[#FDE68A]">
              1. ตำแหน่งวาง Firebase Config
            </h4>
            <p>
              วางค่า Config จาก Firebase Console ลงในไฟล์{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#090E23] text-[#FDE68A]">
                firebase-applet-config.json
              </code>{' '}
              ที่รากโปรเจกต์ (และจัดการ Logic การเชื่อมต่อที่{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#090E23] text-[#FDE68A]">
                src/firebase/config.ts
              </code>
              ) โดยเก็บข้อมูลกระทงในคอลเล็กชัน{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#090E23] text-[#FDE68A]">
                krathongs
              </code>{' '}
              พร้อมอัปเดตแบบ Real-time ผ่าน <code className="text-[#FDE68A]">onSnapshot</code>{' '}
              และเพิ่มหัวใจแบบ Atomic <code className="text-[#FDE68A]">increment(1)</code>
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display text-sm font-semibold text-[#FDE68A]">
              2. ตัวอย่าง Firestore Security Rules (ไฟล์ firestore.rules)
            </h4>
            <p>
              ระบบตั้งค่า Rules เพื่อตรวจความถูกต้องของฟิลด์, จำกัดขนาดข้อมูล, และอนุญาตให้
              Update ได้เฉพาะการกดเพิ่ม <code className="text-[#FDE68A]">heartsCount</code> ทีละ 1:
            </p>
            <pre className="p-3.5 rounded-xl bg-[#090E23] border border-white/10 text-[11px] text-[#E2E8F0] overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        (request.auth.token.email == 'galaxykillergz@gmail.com'
          && request.auth.token.email_verified == true)
      );
    }
    match /krathongs/{krathongId} {
      allow get: if resource.data.id == krathongId;
      allow list: if resource.data.boardId is string;
      allow create: if request.resource.data.heartsCount == 0
        && request.resource.data.createdAt == request.time
        && request.resource.data.toName.size() <= 60
        && request.resource.data.wishText.size() <= 400;
      allow update: if request.resource.data.diff(resource.data)
        .affectedKeys().hasOnly(['heartsCount'])
        && request.resource.data.heartsCount == resource.data.heartsCount + 1;
      allow delete: if isAdmin();
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
