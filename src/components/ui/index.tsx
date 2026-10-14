import React from 'react';
import { X, LucideIcon } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">{children}</div>
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
            {footer}
          </div>)}
      </div>
    </div>);
}

export function Badge({
  tone = 'neutral',
  dot,
  children,
}: {
  tone?: 'brand' | 'info' | 'warning' | 'danger' | 'neutral' | 'success';
  dot?: boolean;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    brand: 'bg-primary/10 text-primary border-primary/20',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotTones: Record<string, string> = {
    brand: 'bg-primary',
    info: 'bg-sky-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    success: 'bg-emerald-600',
    neutral: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        tones[tone] || tones.neutral
      }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotTones[tone] || dotTones.neutral}`} />}
      {children}
    </span>);
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-xl object-cover shadow-sm shrink-0 border border-slate-200`}
        referrerPolicy="no-referrer"
      />);
  }

  return (
    <div
      className={`${sizes[size]} rounded-xl bg-primary text-white font-bold flex items-center justify-center shadow-sm shrink-0`}
    >
      {initials || 'U'}
    </div>);
}

export function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{message}</p>
    </div>);
}

export function LoadingState() {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-medium">جاري التحميل...</span>
    </div>);
}

export function SectionCard({
  children,
  noPadding,
  className = '',
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
        noPadding ? '' : 'p-5'
      } ${className}`}
    >
      {children}
    </div>);
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-danger text-white hover:bg-danger/90',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${className}`}>
      <table className="w-full text-xs text-right">{children}</table>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            active === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 ${className}`}>
      {children}
    </div>
  );
}

export const Card = SectionCard;
