import { useEffect, useRef, useState } from 'react';
import { useApp } from './nav';
import {
  Button, Card, Input, SearchInput, StatusBadge, AIBadge, AIResponse, RiskBadge,
  SourceRef, Disclaimer, Accordion, EmptyState, ErrorState, Skeleton, Modal, StageList,
} from './components';
import {
  IconUpload, IconCompare, IconDocument, IconArrowRight, IconSparkle, IconSearch,
  IconChat, IconClock, IconGoogle, IconTrash, IconCheck, IconWarning, IconChevron,
} from './icons';
import {
  DOCUMENTS, ACTIVITY, SUMMARY, DETAILS, CLAUSES, OBLIGATIONS, DATES, RISK_AREAS,
  NEXT_STEPS, SUGGESTED_QUESTIONS, QA_RESPONSES, COMPARISON, USER, DISCLAIMERS,
  type QAAnswer, type DocumentRecord,
} from './data';

const analysisWidth = { maxWidth: 'var(--container-analysis)', margin: '0 auto', width: '100%' };
const readingWidth = { maxWidth: 'var(--container-reading)', margin: '0 auto', width: '100%' };

/* ══ Section header used inside authenticated pages ══════════════════════ */
function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
      <div>
        <h1 className="t-h1">{title}</h1>
        {subtitle && <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ══ 11.1 Landing ═══════════════════════════════════════════════════════ */
export function Landing() {
  const { navigate } = useApp();
  const capabilities = [
    { icon: <IconUpload size={22} />, title: 'Upload', text: 'Add a PDF, DOCX, or TXT document securely.' },
    { icon: <IconSparkle size={22} />, title: 'Analyze', text: 'Get a plain-language summary and key clauses.' },
    { icon: <IconCompare size={22} />, title: 'Compare', text: 'See meaningful differences between two documents.' },
    { icon: <IconChat size={22} />, title: 'Q&A', text: 'Ask questions and get answers grounded in your document.' },
  ];
  return (
    <div className="animate-page" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--color-border)' }}>
        <Logo />
        <Button variant="secondary" size="sm" onClick={() => navigate('auth')}><IconGoogle size={16} />Sign In</Button>
      </header>

      <main id="main" style={{ flex: 1 }}>
        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px)', display: 'grid', gap: 48, gridTemplateColumns: 'minmax(0,1fr)', alignItems: 'center' }} className="landing-hero">
          <div style={{ maxWidth: 620 }}>
            <span className="t-label" style={{ color: 'var(--color-secondary)' }}>Modern legal clarity, responsible AI</span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '12px 0 16px' }}>
              Understand your legal documents without being a legal expert.
            </h1>
            <p className="t-body-lg" style={{ color: 'var(--color-text-secondary)', maxWidth: 540 }}>
              LegalEase-AI reads your contracts, leases, and agreements and explains them in plain language — with sources, so you always know where each insight comes from.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <Button onClick={() => navigate('auth')}>Upload a Document <IconArrowRight size={18} /></Button>
              <Button variant="secondary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Learn How It Works</Button>
            </div>
            <p className="t-caption" style={{ color: 'var(--color-text-muted)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSparkle size={14} /> Powered by Google Gemini AI
            </p>
          </div>
          <HeroGraphic />
        </section>

        <section id="how" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) 64px' }}>
          <h2 className="t-h2" style={{ marginBottom: 24 }}>How it works</h2>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {capabilities.map((c) => (
              <Card key={c.title}>
                <span style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)' }}>{c.icon}</span>
                <h3 className="t-h3" style={{ margin: '16px 0 8px' }}>{c.title}</h3>
                <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--color-primary-light)', padding: '48px clamp(16px, 4vw, 48px)' }}>
          <div style={{ maxWidth: 'var(--container-reading)', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="t-h2">Private and secure by design</h2>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>
              Your documents are stored securely in your account and processed only for analysis purposes. They are not shared with third parties.
            </p>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Disclaimer level="general" text={DISCLAIMERS.general} learnMore />
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Logo small />
          <p className="t-caption" style={{ color: 'var(--color-text-muted)' }}>LegalEase-AI helps you understand legal documents. It does not replace a lawyer.</p>
        </div>
      </footer>
    </div>
  );
}

function Logo({ small }: { small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: small ? 28 : 34, height: small ? 28 : 34, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff' }}>
        <IconDocument size={small ? 16 : 20} />
      </span>
      <span style={{ fontWeight: 700, fontSize: small ? 15 : 18, letterSpacing: '-0.01em' }}>LegalEase-AI</span>
    </div>
  );
}

function HeroGraphic() {
  return (
    <div aria-hidden style={{ position: 'relative', minHeight: 260 }}>
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <IconDocument size={18} /><span className="t-body-sm" style={{ fontWeight: 600 }}>Lease_Agreement.pdf</span>
          <span style={{ marginLeft: 'auto' }}><StatusBadge status="analyzed" /></span>
        </div>
        {[92, 78, 85, 60].map((w, i) => <div key={i} style={{ height: 8, width: `${w}%`, borderRadius: 4, background: 'var(--color-primary-light)', marginBottom: 10 }} />)}
        <div style={{ marginTop: 16 }}><AIResponse><span className="t-body-sm">This is a 12-month lease with an auto-renewal clause. <SourceRef section="Section 12.3" page={11} /></span></AIResponse></div>
      </Card>
    </div>
  );
}

/* ══ 11.2 Authentication ════════════════════════════════════════════════ */
export function Auth() {
  const { signIn, navigate } = useApp();
  const [state, setState] = useState<'default' | 'loading' | 'error'>('default');
  const attempt = () => {
    setState('loading');
    setTimeout(() => {
      // Deterministic happy path for demo; error path reachable via retry toggle.
      signIn();
    }, 1100);
  };
  return (
    <div className="animate-page" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
      <button onClick={() => navigate('landing')} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }} className="t-body-sm">← Back</button>
      <Logo />
      <Card style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 32 }}>
        <h1 className="t-h2" style={{ marginBottom: 8 }}>Welcome to LegalEase-AI</h1>
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Sign in to upload and understand your legal documents.</p>

        {state === 'error' && (
          <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
            <IconWarning size={16} /><span className="t-body-sm">Sign-in failed. Please try again.</span>
          </div>
        )}

        <Button full loading={state === 'loading'} onClick={attempt}>
          {state === 'loading' ? 'Connecting…' : <><IconGoogle size={18} />Continue with Google</>}
        </Button>

        <p className="t-caption" style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
          Your documents are private and stored securely.
        </p>
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <Disclaimer level="general" text="This tool helps you understand documents. It does not provide legal advice." />
        </div>
      </Card>
    </div>
  );
}

/* ══ 11.3 Dashboard ═════════════════════════════════════════════════════ */
export function Dashboard() {
  const { navigate, hasDocuments } = useApp();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const docs = DOCUMENTS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="animate-page">
      <PageHeader title={`Welcome back, ${USER.name.split(' ')[0]} 👋`} subtitle="Your document workspace." />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 32 }}>
        <QuickAction icon={<IconUpload size={22} />} title="Upload Document" text="Add a new legal document" onClick={() => navigate('upload')} />
        <QuickAction icon={<IconCompare size={22} />} title="Compare Documents" text="Find differences between two files" onClick={() => navigate('compare')} />
      </div>

      {!hasDocuments ? (
        <Card>
          <EmptyState
            icon={<IconDocument size={56} />}
            title="No documents yet"
            description="Upload your first legal document to get started. Supports PDF, DOCX, and TXT files (max 10 MB)."
            action={<Button onClick={() => navigate('upload')}>Upload Document <IconArrowRight size={18} /></Button>}
          />
        </Card>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <h2 className="t-h3">Recent Documents</h2>
            <button onClick={() => navigate('history')} className="t-body-sm" style={{ background: 'none', border: 'none', color: 'var(--color-info)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>View All <IconArrowRight size={16} /></button>
          </div>
          <div style={{ maxWidth: 420, marginBottom: 16 }}>
            <SearchInput value={query} onChange={setQuery} onClear={() => setQuery('')} />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1, 2].map((i) => <Card key={i}><Skeleton w="40%" /><Skeleton w="60%" h={12} style={{ marginTop: 10 }} /></Card>)}
            </div>
          ) : docs.length === 0 ? (
            <Card><EmptyState icon={<IconSearch size={48} />} title="No results found" description={`No documents match “${query}”. Try different terms.`} action={<Button variant="secondary" onClick={() => setQuery('')}>Clear Search</Button>} /></Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {docs.slice(0, 3).map((d) => <DocRow key={d.id} doc={d} />)}
            </div>
          )}

          <h2 className="t-h3" style={{ margin: '32px 0 12px' }}>Recent Activity</h2>
          <Card style={{ padding: 0 }}>
            {ACTIVITY.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderTop: i ? '1px solid var(--color-border)' : 'none' }}>
                <span className="t-body-sm">{a.text}</span>
                <span className="t-caption" style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{a.when}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      <div style={{ marginTop: 32 }}><Disclaimer level="general" text={DISCLAIMERS.general} /></div>
    </div>
  );
}

function QuickAction({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color var(--transition-normal)' }} className="le-quick">
      <span style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)' }}>{icon}</span>
      <span>
        <span className="t-h4" style={{ display: 'block' }}>{title}</span>
        <span className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{text}</span>
      </span>
      <IconArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
    </button>
  );
}

function DocRow({ doc, actions }: { doc: DocumentRecord; actions?: React.ReactNode }) {
  const { navigate } = useApp();
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--color-secondary)', display: 'flex' }}><IconDocument size={24} /></span>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div className="t-h4">{doc.name}</div>
        <div className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          {new Date(doc.uploaded).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · {doc.pages} pages · {doc.clauses} clauses
        </div>
      </div>
      <StatusBadge status={doc.status} />
      {actions ?? (
        doc.status === 'processing'
          ? <Button size="sm" variant="secondary" onClick={() => navigate('processing')}>View</Button>
          : <Button size="sm" variant="secondary" onClick={() => navigate('analysis')}>View <IconArrowRight size={16} /></Button>
      )}
    </Card>
  );
}

/* ══ 11.4 Upload ════════════════════════════════════════════════════════ */
type UploadPhase = 'idle' | 'ready' | 'uploading' | 'failed' | 'error';
const SAMPLE_FILE = { name: 'Lease_Agreement.pdf', size: 248_000 };

export function Upload() {
  const { navigate, toast, setHasDocuments } = useApp();
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ name: string; size: number }>(SAMPLE_FILE);
  const inputRef = useRef<HTMLInputElement>(null);

  const fmtSize = (bytes: number) => bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;

  const validate = (f: File) => {
    const okTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const okExt = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!okTypes.includes(f.type) && !okExt) return 'Please upload a PDF, DOCX, or TXT file.';
    if (f.size > 10 * 1024 * 1024) return 'File exceeds 10 MB limit. Please upload a smaller file.';
    if (f.size === 0) return 'Document contains no readable text. Try a different file.';
    return null;
  };

  // Select (from picker/drop) → validate → show Ready preview. No file = sample.
  const select = (f?: File) => {
    if (f) {
      const err = validate(f);
      if (err) { setErrMsg(err); setPhase('error'); return; }
      setFile({ name: f.name, size: f.size });
    } else {
      setFile(SAMPLE_FILE);
    }
    setPhase('ready');
  };

  const beginUpload = () => { setPhase('uploading'); setProgress(0); };

  // Simulated transfer; ~1-in-6 network failure demonstrates the retry path.
  const failRoll = useRef(false);
  useEffect(() => {
    if (phase !== 'uploading') return;
    if (progress === 0) failRoll.current = Math.random() < 0.16;
    if (progress >= 60 && failRoll.current) {
      const t = setTimeout(() => setPhase('failed'), 200);
      return () => clearTimeout(t);
    }
    if (progress >= 100) {
      const t = setTimeout(() => { setHasDocuments(true); navigate('processing'); }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress((p) => Math.min(100, p + 10)), 170);
    return () => clearTimeout(t);
  }, [phase, progress, navigate, setHasDocuments]);

  const stageState = (threshold: number): 'done' | 'active' | 'pending' =>
    progress >= threshold ? 'done' : progress >= threshold - 25 ? 'active' : 'pending';

  return (
    <div className="animate-page" style={readingWidth}>
      <button onClick={() => navigate('dashboard')} className="t-body-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 16 }}>← Back to Dashboard</button>
      <PageHeader title="Upload Document" />

      {phase === 'error' && (
        <Card style={{ marginBottom: 20 }}>
          <ErrorState
            title="Couldn’t use that file"
            message={errMsg}
            actions={<Button onClick={() => { setPhase('idle'); inputRef.current?.click(); }}>Choose a different file</Button>}
          />
        </Card>
      )}

      {phase === 'failed' ? (
        <Card>
          <ErrorState
            title="Upload failed"
            message="Connection lost while uploading your document. Check your network and try again."
            actions={<>
              <Button onClick={beginUpload}>Retry</Button>
              <Button variant="secondary" onClick={() => setPhase('idle')}>Choose a different file</Button>
            </>}
          />
        </Card>
      ) : phase === 'ready' ? (
        <Card>
          <span className="t-label" style={{ color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCheck size={16} />Ready to analyze</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 20px' }}>
            <span style={{ color: 'var(--color-secondary)', display: 'flex' }}><IconDocument size={28} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-h4" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
              <div className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{fmtSize(file.size)} · ready</div>
            </div>
            <StatusBadge status="uploaded" />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={beginUpload}>Analyze document <IconArrowRight size={18} /></Button>
            <Button variant="secondary" onClick={() => { setPhase('idle'); inputRef.current?.click(); }}>Choose a different file</Button>
          </div>
          <p className="t-caption" style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>Sample/demo document — no real user data.</p>
        </Card>
      ) : phase === 'uploading' ? (
        <Card>
          <div className="t-h4" style={{ marginBottom: 16 }}>{file.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 170ms linear' }} />
            </div>
            <span className="t-mono t-body-sm" style={{ color: 'var(--color-text-secondary)' }} aria-live="polite">{progress}%</span>
          </div>
          <StageList stages={[
            { label: 'Uploading', state: stageState(50) },
            { label: 'Validating file type', state: stageState(75) },
            { label: 'Extracting text', state: stageState(95) },
            { label: 'Ready', state: progress >= 100 ? 'done' : 'pending' },
          ]} />
          <div style={{ marginTop: 20 }}><Button variant="secondary" onClick={() => { setPhase('idle'); setProgress(0); }}>Cancel</Button></div>
        </Card>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); select(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            aria-label="Upload document drop zone"
            style={{
              border: `2px dashed ${drag ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
              background: drag ? 'var(--color-primary-light)' : 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', cursor: 'pointer',
              transition: 'all var(--transition-normal)',
            }}
          >
            <span style={{ color: 'var(--color-secondary)', display: 'inline-flex' }}><IconUpload size={44} /></span>
            <h3 className="t-h3" style={{ margin: '16px 0 6px' }}>Drop your document here</h3>
            <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>or click to browse files</p>
            <p className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Supported: PDF, DOCX, TXT · Max: 10 MB</p>
          </div>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => select(e.target.files?.[0] ?? undefined)} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span className="t-caption" style={{ color: 'var(--color-text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>
          <Button variant="secondary" full onClick={() => select()}>Use a sample document</Button>

          <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconCheck size={16} /> Documents are processed securely and stored only for your account.
          </p>
          <div style={{ marginTop: 12 }}><Disclaimer level="general" text={DISCLAIMERS.general} /></div>
        </>
      )}
    </div>
  );
}

/* ══ 11.5 Processing ════════════════════════════════════════════════════ */
export function Processing() {
  const { navigate } = useApp();
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const labels = ['Uploading document', 'Validating file', 'Extracting text', 'Preparing AI analysis', 'Identifying key clauses', 'Detecting risk areas', 'Generating next steps'];

  useEffect(() => {
    if (failed) return;
    if (step >= labels.length) { const t = setTimeout(() => navigate('analysis'), 900); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [step, failed, navigate, labels.length]);

  return (
    <div className="animate-page" style={readingWidth}>
      <PageHeader title="Processing" />
      {failed ? (
        <Card>
          <ErrorState
            title="Processing failed"
            message="We couldn’t process this document right now. The file may be corrupted or encrypted, or it may be too large."
            actions={<>
              <Button onClick={() => { setFailed(false); setStep(0); }}>Retry</Button>
              <Button variant="secondary" onClick={() => navigate('upload')}>Upload a different document</Button>
            </>}
          />
          <p className="t-caption" style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 12 }}>Contact support if this continues.</p>
        </Card>
      ) : (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <IconDocument size={18} /><span className="t-h4">Lease_Agreement.pdf</span>
            <span style={{ marginLeft: 'auto' }}><AIBadge /></span>
          </div>
          {step >= labels.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-success)' }}>
              <IconCheck size={22} /><span className="t-h4" style={{ color: 'var(--color-success)' }}>Complete — opening your analysis…</span>
            </div>
          ) : (
            <StageList stages={labels.map((label, i) => ({ label, state: i < step ? 'done' : i === step ? 'active' : 'pending' }))} />
          )}
          <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 20 }}>Estimated: a few moments. Please wait.</p>
          <div style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginTop: 12 }} className="t-body-sm">
            Do not close this page. Your document is being processed.
          </div>
          <div style={{ marginTop: 20 }}><Button variant="secondary" onClick={() => setConfirmCancel(true)}>Cancel</Button></div>
        </Card>
      )}
      <div style={{ marginTop: 16 }}><Disclaimer level="general" text={DISCLAIMERS.general} /></div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel processing?"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmCancel(false)}>Keep processing</Button>
          <Button variant="danger" onClick={() => navigate('dashboard')}>Stop processing</Button>
        </>}
      >
        Are you sure? Processing will stop and this document will remain unanalyzed.
      </Modal>
    </div>
  );
}

/* ══ 11.6 Analysis (Summary, Clauses, Obligations, Dates, Risks) ════════ */
export function Analysis() {
  const { navigate } = useApp();
  return (
    <div className="animate-page" style={analysisWidth}>
      <button onClick={() => navigate('dashboard')} className="t-body-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 16 }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h1 className="t-h1" style={{ fontSize: 26 }}>Lease_Agreement.pdf</h1>
        <StatusBadge status="analyzed" />
        <span style={{ marginLeft: 'auto' }}><AIBadge label="AI Analysis — informational only" /></span>
      </div>

      <div style={{ marginBottom: 24 }}><Disclaimer level="analysis" text={DISCLAIMERS.analysis} /></div>
      <div style={{ marginBottom: 24 }}><Disclaimer level="high" text={DISCLAIMERS.highRisk} /></div>

      {/* Summary + Details */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><h2 className="t-h3">Document Summary</h2><AIBadge /></div>
          <AIResponse><p className="t-body" style={{ margin: 0 }}>{SUMMARY}</p></AIResponse>
        </Card>
        <Card>
          <h2 className="t-h3" style={{ marginBottom: 12 }}>Document Details</h2>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px' }}>
            {DETAILS.map((d) => (
              <div key={d.label} style={{ display: 'contents' }}>
                <dt className="t-caption" style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</dt>
                <dd className="t-body-sm" style={{ margin: 0, fontWeight: 500 }}>{d.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {/* Key Clauses */}
      <Card style={{ marginBottom: 24, padding: '8px 24px 0' }}>
        <h2 className="t-h3" style={{ padding: '16px 0 4px' }}>Key Clauses</h2>
        {CLAUSES.map((c) => (
          <Accordion
            key={c.id}
            title={c.title}
            meta={`${c.section} · Page ${c.page}`}
            badge={<RiskBadge level={c.risk} />}
          >
            <ClauseBody clause={c} />
          </Accordion>
        ))}
      </Card>

      {/* Obligations */}
      <Card style={{ marginBottom: 24 }}>
        <h2 className="t-h3" style={{ marginBottom: 12 }}>Obligations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OBLIGATIONS.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <span className="t-label" style={{ color: 'var(--color-secondary)', minWidth: 80 }}>{o.party}</span>
              <span className="t-body-sm" style={{ flex: 1 }}>{o.text}</span>
              <SourceRef section={o.section} page={o.page} />
            </div>
          ))}
        </div>
      </Card>

      {/* Dates */}
      <Card style={{ marginBottom: 24 }}>
        <h2 className="t-h3" style={{ marginBottom: 12 }}>Important Dates</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DATES.map((d) => (
            <div key={d.label} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <span className="t-body-sm" style={{ fontWeight: 600, minWidth: 140 }}>{d.label}</span>
              <span className="t-body-sm" style={{ flex: 1 }}>{d.value}</span>
              <SourceRef section={d.section} page={d.page} />
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Areas */}
      <Card style={{ marginBottom: 24 }}>
        <h2 className="t-h3" style={{ marginBottom: 16 }}>Risk / Attention Areas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {RISK_AREAS.map((r) => <RiskItem key={r.id} risk={r} />)}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Button onClick={() => navigate('qa')}><IconChat size={18} />Ask a Question</Button>
        <Button variant="secondary" onClick={() => navigate('nextsteps')}>View Next Steps <IconArrowRight size={18} /></Button>
        <Button variant="secondary" onClick={() => navigate('compare')}><IconCompare size={18} />Compare</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AIBadge label="All results above were generated by AI" />
        <Disclaimer level="general" text={DISCLAIMERS.general} />
      </div>
    </div>
  );
}

function ClauseBody({ clause }: { clause: (typeof CLAUSES)[number] }) {
  const [showOriginal, setShowOriginal] = useState(false);
  return (
    <div className="t-body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><strong>What it says (paraphrased):</strong><p style={{ margin: '4px 0 0' }}>{clause.paraphrase}</p></div>
      <div><strong>Why it matters:</strong><p style={{ margin: '4px 0 0' }}>{clause.whyItMatters}</p></div>
      <div>
        <strong>What to clarify:</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{clause.clarify.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      {showOriginal && (
        <blockquote style={{ margin: 0, borderLeft: '3px solid var(--color-border-strong)', paddingLeft: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }} className="t-doc">
          “{clause.original}”
        </blockquote>
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <SourceRef section={clause.section} page={clause.page} />
        <button onClick={() => setShowOriginal((s) => !s)} className="t-body-sm" style={{ background: 'none', border: 'none', color: 'var(--color-info)', cursor: 'pointer', padding: 0 }}>
          {showOriginal ? 'Hide original text' : 'Show original text'}
        </button>
      </div>
    </div>
  );
}

function RiskItem({ risk }: { risk: (typeof RISK_AREAS)[number] }) {
  return (
    <article style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <RiskBadge level={risk.level} />
        <h3 className="t-h4">{risk.title}</h3>
        <span className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{risk.category}</span>
      </div>
      <p className="t-body-sm">{risk.summary}</p>
      <p className="t-body-sm" style={{ marginTop: 8 }}><strong>Why this may deserve attention:</strong> {risk.whyAttention}</p>
      <div className="t-body-sm" style={{ marginTop: 8 }}>
        <strong>What you may want to clarify:</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{risk.clarify.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <p className="t-body-sm" style={{ marginTop: 8, color: 'var(--color-text-secondary)' }}>Consider discussing this with a qualified legal professional if it affects your decisions.</p>
      <div style={{ marginTop: 10 }}><SourceRef section={risk.section} page={risk.page} /></div>
    </article>
  );
}

/* ══ 11.9 Document Q&A ══════════════════════════════════════════════════ */
interface QAThread { question: string; answer: QAAnswer | null; status: 'loading' | 'done' | 'error' }
export function QA() {
  const { navigate } = useApp();
  const [input, setInput] = useState('');
  const [thread, setThread] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(false);

  const resolve = (index: number, question: string) => {
    setLoading(true);
    setThread((t) => t.map((x, i) => (i === index ? { ...x, status: 'loading', answer: null } : x)));
    setTimeout(() => {
      // Known demo questions always resolve; free-text has a small chance of a service error.
      const known = !!QA_RESPONSES[question];
      if (!known && Math.random() < 0.18) {
        setThread((t) => t.map((x, i) => (i === index ? { ...x, status: 'error', answer: null } : x)));
        setLoading(false);
        return;
      }
      const answer: QAAnswer = QA_RESPONSES[question] ?? {
        finding: 'This information is not present in the uploaded document. Try asking a different question.',
        sources: [], confidence: 'limited information', notFound: true,
      };
      setThread((t) => t.map((x, i) => (i === index ? { ...x, status: 'done', answer } : x)));
      setLoading(false);
    }, 1200);
  };

  const ask = (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    setInput('');
    const index = thread.length;
    setThread((t) => [...t, { question, answer: null, status: 'loading' }]);
    resolve(index, question);
  };

  const retry = (index: number) => { if (!loading) resolve(index, thread[index].question); };

  return (
    <div className="animate-page" style={analysisWidth}>
      <button onClick={() => navigate('analysis')} className="t-body-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 16 }}>← Back to Analysis</button>
      <PageHeader title="Document Q&A" subtitle="Lease_Agreement.pdf" />

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          aria-label="Ask a question about your document"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your document…"
          style={{ flex: 1, height: 48, padding: '0 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 16, background: 'var(--color-surface)' }}
        />
        <Button type="submit" disabled={!input.trim()} style={{ height: 48 }}>Ask <IconArrowRight size={18} /></Button>
      </form>
      <p className="t-caption" style={{ color: 'var(--color-text-secondary)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}><IconSparkle size={14} />Answer based on your document.</p>

      {thread.length === 0 ? (
        <EmptyState
          icon={<IconChat size={56} />}
          title="Ask a question"
          description="Type any question about your document. AI will answer based on its content."
          action={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <span className="t-label" style={{ color: 'var(--color-text-muted)' }}>Suggested questions</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SUGGESTED_QUESTIONS.map((q) => <Chip key={q} onClick={() => ask(q)}>{q}</Chip>)}
              </div>
            </div>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {thread.map((t, i) => (
            <div key={i}>
              <p className="t-h4" style={{ marginBottom: 10 }}>{t.question}</p>
              {t.status === 'loading' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-ai)' }} aria-live="polite">
                  <span className="spinner" style={{ borderTopColor: 'var(--color-ai)' }} />
                  <span className="t-body-sm">Analyzing your question against the document…</span>
                </div>
              ) : t.status === 'error' ? (
                <div role="alert" style={{ display: 'flex', gap: 10, background: 'var(--color-error-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-error)', flexShrink: 0 }}><IconWarning size={18} /></span>
                  <div style={{ flex: 1 }}>
                    <p className="t-body-sm" style={{ margin: 0 }}>We couldn’t answer right now. Please try again.</p>
                    <div style={{ marginTop: 10 }}><Button size="sm" onClick={() => retry(i)} loading={loading}>Retry</Button></div>
                  </div>
                </div>
              ) : t.answer ? (
                <AnswerBlock answer={t.answer} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="t-body-sm" style={{ padding: '8px 14px', minHeight: 40, borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 500 }}>
      {children}
    </button>
  );
}

function AnswerBlock({ answer }: { answer: QAAnswer }) {
  return (
    <div aria-live="polite">
      <div style={{ marginBottom: 10 }}><AIBadge /></div>
      <AIResponse>
        <p className="t-body" style={{ margin: 0 }}>{answer.finding}</p>
        {answer.sources.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
            {answer.sources.map((s) => <SourceRef key={s.section} section={s.section} page={s.page} />)}
          </div>
        )}
        <p className="t-body-sm" style={{ marginTop: 12, color: 'var(--color-text-secondary)' }}>
          I’m {answer.confidence} in this answer based on the document.
          {answer.confidence === 'limited information' && ' Consider verifying this with a qualified legal professional.'}
        </p>
      </AIResponse>
      <div style={{ marginTop: 10 }}>
        <Disclaimer level="analysis" text={DISCLAIMERS.analysis} />
      </div>
    </div>
  );
}

/* ══ 11.10 Comparison ═══════════════════════════════════════════════════ */
export function Compare() {
  const { navigate, hasDocuments } = useApp();
  const [tab, setTab] = useState<'a' | 'b'>('a');
  if (!hasDocuments) {
    return (
      <div className="animate-page" style={analysisWidth}>
        <PageHeader title="Document Comparison" />
        <Card><EmptyState icon={<IconCompare size={56} />} title="No comparisons yet" description="Select two documents to compare and find key differences." action={<Button onClick={() => navigate('upload')}>Compare Documents</Button>} /></Card>
      </div>
    );
  }
  const { docA, docB, differences, added, removed, modified, nextSteps } = COMPARISON;
  return (
    <div className="animate-page" style={analysisWidth}>
      <PageHeader title="Document Comparison" />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <Card><div className="t-h4">{docA.name}</div><div className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', margin: '4px 0 8px' }}>{docA.version}</div><StatusBadge status={docA.status} /></Card>
        <Card><div className="t-h4">{docB.name}</div><div className="t-caption t-mono" style={{ color: 'var(--color-text-muted)', margin: '4px 0 8px' }}>{docB.version}</div><StatusBadge status={docB.status} /></Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <AIBadge /><span className="t-h4">Differences found: {differences}</span>
      </div>

      {/* Mobile tab switcher */}
      <div className="compare-tabs" style={{ display: 'none', gap: 8, marginBottom: 16 }}>
        <Chip onClick={() => setTab('a')}>{docA.name}</Chip>
        <Chip onClick={() => setTab('b')}>{docB.name}</Chip>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12, color: 'var(--color-success)' }}>Added Clauses</h3>
        {added.map((a) => (
          <DiffRow key={a.title} accent="var(--color-success)" prefix="+" title={`${a.title} (${a.note})`} section={a.section} page={a.page} />
        ))}
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12, color: 'var(--color-error)' }}>Removed Clauses</h3>
        {removed.map((r) => (
          <DiffRow key={r.title} accent="var(--color-error)" prefix="–" title={`${r.title} (${r.note})`} section={r.section} page={r.page} />
        ))}
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12, color: 'var(--color-warning)' }}>Modified Clauses</h3>
        {modified.map((m) => (
          <div key={m.title} style={{ borderLeft: '3px solid var(--color-warning)', paddingLeft: 12, marginBottom: 14 }}>
            <div className="t-body-sm" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><span aria-hidden>▼</span>{m.title}</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>{docB.version}: {m.before}</div>
            <div className="t-body-sm" style={{ marginTop: 2 }}>{docA.version}: <strong>{m.after}</strong></div>
            <div style={{ marginTop: 6 }}><SourceRef section={m.section} page={m.page} /></div>
          </div>
        ))}
      </Card>

      <div style={{ marginBottom: 16 }}><Disclaimer level="analysis" text="These documents appear to be similar types. Comparison is most meaningful for documents of the same type." /></div>

      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Recommended Next Steps</h3>
        <Checklist items={nextSteps} />
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AIBadge label="Comparison generated by AI" />
        <Disclaimer level="general" text={DISCLAIMERS.general} />
      </div>
    </div>
  );
}

function DiffRow({ accent, prefix, title, section, page }: { accent: string; prefix: string; title: string; section: string; page: number }) {
  return (
    <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12, marginBottom: 10 }}>
      <div className="t-body-sm" style={{ fontWeight: 500 }}><span style={{ color: accent, fontWeight: 700, marginRight: 6 }}>{prefix}</span>{title}</div>
      <div style={{ marginTop: 4 }}><SourceRef section={section} page={page} /></div>
    </div>
  );
}

/* ══ 11.11 Next Steps ═══════════════════════════════════════════════════ */
export function NextSteps() {
  const { navigate } = useApp();
  return (
    <div className="animate-page" style={readingWidth}>
      <button onClick={() => navigate('analysis')} className="t-body-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: 16 }}>← Back to Analysis</button>
      <PageHeader title="Recommended Next Steps" />

      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Action Items</h3>
        <Checklist items={NEXT_STEPS.actions} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Questions to Ask a Lawyer</h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }} className="t-body-sm">
          {NEXT_STEPS.lawyerQuestions.map((q) => <li key={q}>{q}</li>)}
        </ul>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Documents You May Need</h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }} className="t-body-sm">
          {NEXT_STEPS.documents.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Things to Clarify with the Other Party</h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }} className="t-body-sm">
          {NEXT_STEPS.clarify.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Card>

      <div style={{ marginBottom: 16 }}><Disclaimer level="high" text="Consider professional legal help if the document involves significant financial commitment, long-term obligations, or you have concerns about fairness." /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AIBadge label="Guidance generated by AI" />
        <Disclaimer level="general" text={DISCLAIMERS.general} />
      </div>
      <div style={{ marginTop: 20 }}><Button variant="secondary" onClick={() => navigate('dashboard')}>Back to Dashboard</Button></div>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={item}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', minHeight: 32 }} className="t-body-sm">
            <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--color-primary)' }} />
            <span style={{ textDecoration: checked.has(i) ? 'line-through' : 'none', color: checked.has(i) ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/* ══ 11.12 History ══════════════════════════════════════════════════════ */
export function History() {
  const { navigate, hasDocuments, toast, setHasDocuments } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'processing' | 'uploaded'>('all');
  const [toDelete, setToDelete] = useState<DocumentRecord | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const [docs, setDocs] = useState(DOCUMENTS);

  const filtered = docs.filter((d) =>
    (filter === 'all' || d.status === filter) &&
    d.name.toLowerCase().includes(query.toLowerCase()));

  if (!hasDocuments || docs.length === 0) {
    return (
      <div className="animate-page">
        <PageHeader title="Document History" />
        <Card><EmptyState icon={<IconClock size={56} />} title="No recent activity" description="Documents you upload will appear here." action={<Button onClick={() => navigate('upload')}>Upload Document</Button>} /></Card>
      </div>
    );
  }

  return (
    <div className="animate-page">
      <PageHeader title="Document History" right={docs.length > 0 && <Button variant="secondary" size="sm" onClick={() => setDeleteAll(true)}><IconTrash size={16} />Delete All</Button>} />

      <div style={{ maxWidth: 480, marginBottom: 16 }}><SearchInput value={query} onChange={setQuery} onClear={() => setQuery('')} /></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'analyzed', 'processing', 'uploaded'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="t-body-sm" style={{ padding: '8px 14px', minHeight: 40, borderRadius: 999, cursor: 'pointer', textTransform: 'capitalize', border: `1px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`, background: filter === f ? 'var(--color-primary-light)' : 'var(--color-surface)', color: filter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: filter === f ? 600 : 400 }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<IconSearch size={48} />} title="No results found" description={query ? `No documents match “${query}”. Try different terms.` : 'No documents match the selected filter.'} action={<Button variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</Button>} /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((d) => (
            <DocRow key={d.id} doc={d} actions={
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {d.status === 'processing'
                  ? <Button size="sm" variant="secondary" onClick={() => navigate('processing')}>Retry Analysis</Button>
                  : <><Button size="sm" variant="secondary" onClick={() => navigate('analysis')}>View Analysis</Button>
                     <Button size="sm" variant="secondary" onClick={() => navigate('compare')}>Compare</Button></>}
                <Button size="sm" variant="ghost" onClick={() => setToDelete(d)} aria-label={`Delete ${d.name}`}><IconTrash size={16} /></Button>
              </div>
            } />
          ))}
        </div>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete document?"
        footer={<>
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            setDocs((ds) => { const n = ds.filter((x) => x.id !== toDelete!.id); if (n.length === 0) setHasDocuments(false); return n; });
            toast('success', `“${toDelete!.name}” was deleted.`);
            setToDelete(null);
          }}>Delete Permanently</Button>
        </>}
      >
        <p style={{ margin: 0 }}>“{toDelete?.name}” will be permanently deleted from your account. This action cannot be undone.</p>
        <p style={{ marginTop: 8 }}>This will also delete all analysis results and Q&amp;A history associated with this document.</p>
      </Modal>

      <Modal
        open={deleteAll}
        onClose={() => setDeleteAll(false)}
        title="Delete all documents?"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteAll(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setDocs([]); setHasDocuments(false); toast('success', 'All documents deleted.'); setDeleteAll(false); }}>Delete Permanently</Button>
        </>}
      >
        All documents, analysis results, and Q&amp;A history will be permanently deleted from your account. This action cannot be undone.
      </Modal>
    </div>
  );
}

/* ══ 11.13 Settings ═════════════════════════════════════════════════════ */
export function Settings() {
  const { signOut, toast } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="animate-page" style={readingWidth}>
      <PageHeader title="Settings" />
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 12 }}>Account</h3>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px' }} className="t-body-sm">
          <dt style={{ color: 'var(--color-text-muted)' }}>Email</dt><dd style={{ margin: 0 }}>{USER.email}</dd>
          <dt style={{ color: 'var(--color-text-muted)' }}>Sign-in method</dt><dd style={{ margin: 0 }}>Google OAuth</dd>
          <dt style={{ color: 'var(--color-text-muted)' }}>Account created</dt><dd style={{ margin: 0 }}>{USER.created}</dd>
        </dl>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 8 }}>AI Limitations</h3>
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>This tool uses AI to analyze documents. Results are educational and may contain errors. This tool does not provide legal advice and does not replace a lawyer.</p>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <h3 className="t-h4" style={{ marginBottom: 8 }}>Privacy</h3>
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Documents are stored securely and privately under your account. They are not shared with third parties. Files are encrypted at rest.</p>
      </Card>
      <Card style={{ marginBottom: 16, borderColor: 'var(--color-error)' }}>
        <h3 className="t-h4" style={{ marginBottom: 8, color: 'var(--color-error)' }}>Danger Zone</h3>
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>Deleting your account permanently removes all your data.</p>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete Account</Button>
      </Card>
      <Button variant="secondary" onClick={signOut}>Sign Out</Button>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?" footer={<>
        <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
        <Button variant="danger" onClick={() => { setConfirmDelete(false); toast('info', 'Account deletion would remove all data.'); signOut(); }}>Delete Permanently</Button>
      </>}>
        Your account and all associated documents, analysis, and Q&amp;A history will be permanently deleted. This action cannot be undone.
      </Modal>
    </div>
  );
}
