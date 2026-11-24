import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1024] text-[#FFF8F0] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#161F3E] border border-[#F6C56E]/25 p-6 text-center space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#FDE68A]">
              ขออภัย เกิดข้อผิดพลาดเล็กน้อย
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              ระบบพบปัญหาในการแสดงผลหรือการเชื่อมต่อชั่วคราว กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง
            </p>
            <p className="text-xs text-[#94A3B8] break-words bg-[#0B1024]/70 rounded-lg p-3">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#F6C56E] text-[#0B1024] font-medium text-sm hover:bg-[#FDE68A] transition-colors min-h-[44px]"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
