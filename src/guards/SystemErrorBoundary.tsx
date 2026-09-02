import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Terminal, Wrench } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class SystemErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('⚠️ [System Guard Alert] خطأ داخلي في النظام:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans dir-rtl" dir="rtl">
          <div className="max-w-xl w-full bg-slate-800 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                <AlertOctagon size={32} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">حارس النظام: تم رصد خطأ تشغيلي</h1>
                <p className="text-xs text-slate-400">تدخل حارس الأخطاء (Crash Guard) لمنع توقف التطبيق</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-red-300 border border-slate-700 overflow-x-auto">
              <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-1">
                <Terminal size={14} /> تفاصيل الخطأ البرمجي:
              </div>
              {this.state.error?.toString()}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#714B67] hover:bg-[#5a3a52] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw size={15} /> إعادة تحميل الواجهة
              </button>
              <button
                onClick={this.handleClearCache}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Wrench size={15} /> تنظيف الذاكرة المؤقتة (Fix Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
