// Reusable design-system components (design.md §12–§15).
import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import {
  IconSparkle, IconExternal, IconChevron, IconSearch, IconClose,
  IconWarning, IconCheckCircle, IconError, IconInfo,
} from './icons';
import { RISK_META, type RiskLevel } from './data';

/* ── Button ───────────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  full?: boolean;
}
export function Button({
  variant = 'primary', size = 'md', loading, full, children, className = '', disabled, ...rest
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: size === 'sm' ? 36 : 40, padding: '0 16px', minHeight: 40,
    borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, letterSpacing: '0.01em',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, width: full ? '100%' : undefined,
    border: '1px solid transparent', transition: 'background var(--transition-normal), transform var(--transition-fast)',
    whiteSpace: 'nowrap',
  };
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: 'var(--color-primary)', color: '#fff' },
    secondary: { background: 'transparent', color: 'var(--color-primary)', borderColor: 'var(--color-border)' },
    danger: { background: 'var(--color-error)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--color-text-secondary)' },
  };
  return (
    <button
      className={`le-btn le-btn-${variant} ${className}`}
      style={{ ...base, ...variants[variant] }}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderTopColor: variant === 'secondary' || variant === 'ghost' ? 'var(--color-primary)' : '#fff' }} />}
      {children}
    </button>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */
export function Card({ children, className = '', style, as: As = 'section', ...rest }: { children: ReactNode; className?: string; style?: React.CSSProperties; as?: any } & React.HTMLAttributes<HTMLElement>) {
  return (
    <As
      className={className}
      style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </As>
  );
}

/* ── Input ────────────────────────────────────────────────────────────── */
export function Input({
  label, id, error, hint, ...rest
}: { label?: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label htmlFor={id} className="t-body-sm" style={{ fontWeight: 600 }}>{label}</label>}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        style={{
          height: 44, padding: '0 12px', borderRadius: 'var(--radius-md)', fontSize: 16,
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          background: 'var(--color-surface)', color: 'var(--color-text-primary)', width: '100%',
        }}
        {...rest}
      />
      {hint && !error && <span id={`${id}-hint`} className="t-caption" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>}
      {error && <span id={`${id}-err`} className="t-caption" style={{ color: 'var(--color-error)', display: 'flex', gap: 4, alignItems: 'center' }}><IconError size={14} />{error}</span>}
    </div>
  );
}

/* ── Search input ─────────────────────────────────────────────────────── */
export function SearchInput({ value, onChange, onClear, placeholder = 'Search documents...' }: { value: string; onChange: (v: string) => void; onClear: () => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex' }}>
        <IconSearch size={18} />
      </span>
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 44, width: '100%', padding: '0 40px', borderRadius: 'var(--radius-md)', fontSize: 16,
          border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)',
        }}
      />
      {value && (
        <button aria-label="Clear search" onClick={onClear} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4 }}>
          <IconClose size={18} />
        </button>
      )}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: 'analyzed' | 'processing' | 'uploaded' }) {
  const map = {
    analyzed: { label: 'Analyzed', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    processing: { label: 'Processing', color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
    uploaded: { label: 'Uploaded', color: 'var(--color-text-secondary)', bg: 'var(--color-primary-light)' },
  }[status];
  return (
    <span className="t-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: map.bg, color: map.color, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: map.color }} className={status === 'processing' ? 'pulse-dot' : ''} />
      {map.label}
    </span>
  );
}

/* ── AI badge ─────────────────────────────────────────────────────────── */
export function AIBadge({ label = 'AI-Generated' }: { label?: string }) {
  return (
    <span className="t-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-ai-bg)', color: 'var(--color-ai)' }}>
      <IconSparkle size={13} />{label}
    </span>
  );
}

/* ── AI response container ────────────────────────────────────────────── */
export function AIResponse({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--color-ai-bg)', borderLeft: '3px solid var(--color-ai)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
      {children}
    </div>
  );
}

/* ── Risk badge ───────────────────────────────────────────────────────── */
export function RiskBadge({ level }: { level: RiskLevel }) {
  const m = RISK_META[level];
  return (
    <span className="t-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: m.bg, color: m.color, fontWeight: 600 }}>
      <span aria-hidden style={{ fontSize: 12 }}>{m.symbol}</span>{m.label}
    </span>
  );
}

/* ── Source reference ─────────────────────────────────────────────────── */
export function SourceRef({ section, page, onNavigate }: { section: string; page: number; onNavigate?: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="t-body-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
    >
      <IconExternal size={14} />{section} · Page {page}
    </button>
  );
}

/* ── Disclaimer ───────────────────────────────────────────────────────── */
export function Disclaimer({ level, text, learnMore }: { level: 'general' | 'analysis' | 'high'; text: string; learnMore?: boolean }) {
  const [open, setOpen] = useState(level !== 'general');
  if (level === 'general') {
    return (
      <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {text}{' '}
        {learnMore && <button onClick={() => setOpen((o) => !o)} style={{ background: 'none', border: 'none', color: 'var(--color-info)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Learn more</button>}
        {open && learnMore && <span style={{ display: 'block', marginTop: 6, color: 'var(--color-text-muted)' }}>AI output is educational and never a substitute for advice from a qualified legal professional.</span>}
      </p>
    );
  }
  const styles = level === 'high'
    ? { bg: 'var(--color-error-bg)', border: 'var(--color-error)', color: 'var(--color-error)' }
    : { bg: 'var(--color-warning-bg)', border: 'var(--color-warning)', color: 'var(--color-warning)' };
  return (
    <div role="note" style={{ display: 'flex', gap: 10, background: styles.bg, borderLeft: `3px solid ${styles.border}`, borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
      <span style={{ color: styles.color, flexShrink: 0, marginTop: 1 }}><IconWarning size={18} /></span>
      <p className="t-body-sm" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
        {level === 'high' && <strong style={{ color: styles.color }}>Professional legal review recommended. </strong>}
        {text}
      </p>
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────── */
export function Accordion({ title, badge, meta, children, defaultOpen = false }: { title: ReactNode; badge?: ReactNode; meta?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useRef(`acc-${Math.random().toString(36).slice(2)}`).current;
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 44 }}
      >
        <span style={{ display: 'flex', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-normal)', color: 'var(--color-text-secondary)' }}>
          <IconChevron size={18} />
        </span>
        <span className="t-h4" style={{ flex: 1 }}>{title}</span>
        {meta && <span className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{meta}</span>}
        {badge}
      </button>
      {open && (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-header`} style={{ padding: '0 0 20px 30px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px', gap: 12 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <h3 className="t-h3" style={{ fontSize: 18 }}>{title}</h3>
      <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', maxWidth: 360 }}>{description}</p>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

/* ── Error state ──────────────────────────────────────────────────────── */
export function ErrorState({ title, message, actions }: { title: string; message: string; actions?: ReactNode }) {
  return (
    <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: 12 }}>
      <span style={{ color: 'var(--color-error)' }}><IconWarning size={40} /></span>
      <h3 className="t-h3" style={{ fontSize: 18 }}>{title}</h3>
      <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', maxWidth: 380 }}>{message}</p>
      {actions && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>{actions}</div>}
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */
export function Skeleton({ w = '100%', h = 16, r = 6, style }: { w?: number | string; h?: number; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden />;
}

/* ── Modal ────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 'var(--z-modal)' as any, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-elevated)', padding: 'var(--space-6)', width: '100%', maxWidth: 480, outline: 'none' }}
      >
        <h2 className="t-h3" style={{ marginBottom: 12 }}>{title}</h2>
        <div className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{children}</div>
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────────────────── */
export type ToastKind = 'success' | 'error' | 'warning' | 'info';
export function Toast({ kind, message, onDismiss }: { kind: ToastKind; message: string; onDismiss: () => void }) {
  const meta = {
    success: { color: 'var(--color-success)', icon: <IconCheckCircle size={20} /> },
    error: { color: 'var(--color-error)', icon: <IconError size={20} /> },
    warning: { color: 'var(--color-warning)', icon: <IconWarning size={20} /> },
    info: { color: 'var(--color-info)', icon: <IconInfo size={20} /> },
  }[kind];
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-toast)', borderLeft: `3px solid ${meta.color}`, padding: '12px 14px', maxWidth: 400, animation: 'toast-in 300ms ease-out' }}>
      <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
      <p className="t-body-sm" style={{ flex: 1, margin: 0 }}>{message}</p>
      <button aria-label="Dismiss" onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 2 }}><IconClose size={16} /></button>
    </div>
  );
}

/* ── Processing stage list ────────────────────────────────────────────── */
export function StageList({ stages }: { stages: { label: string; state: 'done' | 'active' | 'pending' }[] }) {
  return (
    <ul aria-live="polite" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {stages.map((s) => (
        <li key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {s.state === 'done' && <span style={{ color: 'var(--color-success)', display: 'flex' }}><IconCheckCircle size={20} /></span>}
          {s.state === 'active' && <span className="spinner" />}
          {s.state === 'pending' && <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--color-border)', display: 'inline-block' }} />}
          <span className="t-body" style={{ color: s.state === 'pending' ? 'var(--color-text-muted)' : 'var(--color-text-primary)', fontWeight: s.state === 'active' ? 600 : 400 }}>
            {s.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
