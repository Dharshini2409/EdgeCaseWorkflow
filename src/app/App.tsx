import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle,
  Search, ChevronRight, Truck, Package, User,
  BookOpen, Loader2, AlertOctagon,
  Check, X, Zap, Eye, RotateCcw,
  Building2, ShieldAlert, ShieldCheck, FileText,
  ArrowRight, Activity, GitMerge
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase =
  | "INTAKE"
  | "INVESTIGATING"
  | "EVIDENCE_READY"
  | "CONFLICT_DETECTED"
  | "POLICY_EVALUATED"
  | "RESOLUTION_PROPOSED"
  | "AWAITING_APPROVAL"
  | "REJECTED"
  | "EXECUTING"
  | "VERIFYING"
  | "RESOLVED"
  | "VERIFICATION_FAILED"
  | "ESCALATED";

interface InvSource {
  id: string;
  name: string;
  type: string;
  status: "PENDING" | "QUERYING" | "RETRIEVED" | "FAILED";
  latency?: string;
}

interface EvidenceItem {
  id: string;
  source: string;
  sourceType: "crm" | "shipping" | "order" | "policy" | "history" | "commitment";
  title: string;
  content: string;
  status: "CONFIRMED" | "CONFLICT" | "INFERRED";
  timestamp: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

// ─── Scenario Data ───────────────────────────────────────────────────────────

const CASE_META = {
  id: "EC-1042",
  freshworksId: "CS-8821",
  title: "Replacement promised — shipment disputed",
  customer: { name: "Mariana Pereira", id: "CUST-18823", tier: "Business", since: "Mar 2021", orders: 14 },
  product: "ProBook X7 Laptop",
  value: 1249.00,
  replacementOrder: "REP-45892",
  opened: "22 Nov 2024 · 08:17 UTC",
  exceptionClass: "BROKEN_PROMISE",
};

const INV_SOURCES: InvSource[] = [
  { id: "fw", name: "Freshworks — Case CS-8821", type: "CRM", status: "PENDING" },
  { id: "hist", name: "Customer History — CUST-18823", type: "CRM", status: "PENDING" },
  { id: "order", name: "Order Record — REP-45892", type: "OMS", status: "PENDING" },
  { id: "ship", name: "FedEx Tracking — 7489210034", type: "SHIPPING", status: "PENDING" },
  { id: "commit", name: "Commitment Notes — CS-8821", type: "CRM", status: "PENDING" },
  { id: "policy", name: "Policy Engine — POL-2024-CS-07", type: "POLICY", status: "PENDING" },
];

const EVIDENCE: EvidenceItem[] = [
  {
    id: "ev1", source: "Freshworks CRM", sourceType: "crm",
    title: "Case CS-8821 — Prior Interaction",
    content: "Customer reported ORD-89234 lost in transit. Case escalated. Agent initiated replacement order REP-45892 on 2024-11-18. Commitment to resolution logged.",
    status: "CONFIRMED", timestamp: "15 Nov 2024 · 09:42", confidence: "HIGH",
  },
  {
    id: "ev2", source: "Customer History", sourceType: "history",
    title: "CUST-18823 — Account Standing",
    content: "3-year Business tier customer. 14 prior orders. One previous dispute (2023), resolved in customer's favour. No fraud indicators. Satisfaction score 4.6 / 5.",
    status: "CONFIRMED", timestamp: "22 Nov 2024 · 08:19", confidence: "HIGH",
  },
  {
    id: "ev3", source: "Order Management", sourceType: "order",
    title: "REP-45892 — Replacement Order",
    content: "ProBook X7 ($1,249.00). Created 18 Nov 2024. Status: SHIPPED. Handed to FedEx 19 Nov 2024. No delivery confirmation from recipient captured.",
    status: "CONFIRMED", timestamp: "22 Nov 2024 · 08:20", confidence: "HIGH",
  },
  {
    id: "ev4", source: "FedEx Tracking API", sourceType: "shipping",
    title: "Tracking 7489210034 — DELIVERED",
    content: "Status: DELIVERED. Date: 20 Nov 2024 · 14:23 EST. Location: front door, 842 Maple St. Signature required: NO. Recipient signature: not captured.",
    status: "CONFLICT", timestamp: "20 Nov 2024 · 14:23", confidence: "HIGH",
  },
  {
    id: "ev5", source: "Commitment Record", sourceType: "commitment",
    title: "Agent Commitment — CS-8821",
    content: "Agent Lena R. (15 Nov): \"We will ensure a replacement reaches you. If delivery is disputed, we are committed to making this right.\" Commitment logged in CRM.",
    status: "CONFIRMED", timestamp: "15 Nov 2024 · 09:45", confidence: "HIGH",
  },
  {
    id: "ev6", source: "Policy Engine", sourceType: "policy",
    title: "POL-2024-CS-07 — Second Replacement",
    content: "Second replacements on orders > $800 require Supervisor approval. Standard agent authority cap: $500. No exceptions without documented approval. §3.2.",
    status: "INFERRED", timestamp: "22 Nov 2024 · 08:21", confidence: "HIGH",
  },
];

const EXECUTION_LOG_NORMAL = [
  "→ Initiating credit issuance via Billing API",
  "→ POST /api/v2/accounts/CUST-18823/credits",
  '  payload: { amount: 1249.00, currency: "USD", reason: "EC-1042", auth: "SUP-APPR-7729" }',
  "← 201 Created — Credit ID: CRED-20241122-8831",
  "→ Updating Freshworks Case CS-8821",
  "← Case status: PENDING_VERIFICATION",
  "→ Queuing customer notification (email + SMS)",
  "← Notification enqueued: NOTIF-28831",
  "✓ Execution complete",
];

const EXECUTION_LOG_FAIL = [
  "→ Initiating credit issuance via Billing API",
  "→ POST /api/v2/accounts/CUST-18823/credits",
  '  payload: { amount: 1249.00, currency: "USD", reason: "EC-1042", auth: "SUP-APPR-7729" }',
  "← 201 Created — Credit ID: CRED-20241122-8831",
  "→ Updating Freshworks Case CS-8821",
  "← Case status: PENDING_VERIFICATION",
  "✓ Execution complete",
];

// ─── Pipeline Definition ─────────────────────────────────────────────────────

const PIPELINE = [
  { id: "intake", label: "Exception Detected", phases: ["INTAKE"] as Phase[] },
  { id: "investigate", label: "Investigation", phases: ["INVESTIGATING", "EVIDENCE_READY"] as Phase[] },
  { id: "reconcile", label: "Evidence Reconciled", phases: ["CONFLICT_DETECTED"] as Phase[] },
  { id: "policy", label: "Policy Evaluated", phases: ["POLICY_EVALUATED"] as Phase[] },
  { id: "resolution", label: "Resolution Proposed", phases: ["RESOLUTION_PROPOSED"] as Phase[] },
  { id: "approval", label: "Authorization", phases: ["AWAITING_APPROVAL", "REJECTED"] as Phase[] },
  { id: "execute", label: "Action Executed", phases: ["EXECUTING"] as Phase[] },
  { id: "verify", label: "Verification", phases: ["VERIFYING", "VERIFICATION_FAILED"] as Phase[] },
  { id: "outcome", label: "Outcome", phases: ["RESOLVED", "ESCALATED"] as Phase[] },
];

const PHASE_INDEX: Record<Phase, number> = {
  INTAKE: 0, INVESTIGATING: 1, EVIDENCE_READY: 1, CONFLICT_DETECTED: 2,
  POLICY_EVALUATED: 3, RESOLUTION_PROPOSED: 4, AWAITING_APPROVAL: 5,
  REJECTED: 5, EXECUTING: 6, VERIFYING: 7, RESOLVED: 8,
  VERIFICATION_FAILED: 7, ESCALATED: 8,
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const SOURCE_ICON: Record<EvidenceItem["sourceType"], React.ReactNode> = {
  crm: <Building2 size={12} />,
  shipping: <Truck size={12} />,
  order: <Package size={12} />,
  policy: <BookOpen size={12} />,
  history: <User size={12} />,
  commitment: <FileText size={12} />,
};

const STATUS_COLORS: Record<EvidenceItem["status"], string> = {
  CONFIRMED: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8",
  CONFLICT: "text-amber-400 border-amber-500/30 bg-amber-500/8",
  INFERRED: "text-cyan-400 border-cyan-500/30 bg-cyan-500/8",
};

function Tag({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const cls: Record<string, string> = {
    slate: "bg-white/5 text-foreground/50 border-white/8",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    red: "bg-red-500/10 text-red-400 border-red-500/25",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-[10px] tracking-wider uppercase ${cls[color]}`}>
      {children}
    </span>
  );
}

function EvidenceCard({ item, index }: { item: EvidenceItem; index: number }) {
  return (
    <div
      className="border border-border rounded p-3 space-y-2 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
          {SOURCE_ICON[item.sourceType]}
          <span className="font-mono">{item.source}</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border rounded font-mono text-[10px] tracking-wider uppercase ${STATUS_COLORS[item.status]}`}>
          {item.status === "CONFLICT" && <AlertTriangle size={9} />}
          {item.status === "CONFIRMED" && <Check size={9} />}
          {item.status}
        </span>
      </div>
      <p className="text-[11px] font-semibold text-foreground/80">{item.title}</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.content}</p>
      <p className="text-[10px] text-muted-foreground/50 font-mono">{item.timestamp}</p>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState<Phase>("INTAKE");
  const [sources, setSources] = useState<InvSource[]>(INV_SOURCES);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [failMode, setFailMode] = useState(false);
  const [execLog, setExecLog] = useState<string[]>([]);
  const [logComplete, setLogComplete] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const currentStep = PHASE_INDEX[phase] ?? 0;

  // Reset for fresh demo
  function reset() {
    setPhase("INTAKE");
    setSources(INV_SOURCES);
    setEvidence([]);
    setExecLog([]);
    setLogComplete(false);
  }

  // Investigation auto-advance
  useEffect(() => {
    if (phase !== "INVESTIGATING") return;
    const delays: ReturnType<typeof setTimeout>[] = [];

    INV_SOURCES.forEach((src, i) => {
      delays.push(setTimeout(() => {
        setSources(prev => prev.map(s => s.id === src.id ? { ...s, status: "QUERYING" } : s));
      }, i * 380 + 100));

      delays.push(setTimeout(() => {
        setSources(prev => prev.map(s => s.id === src.id ? { ...s, status: "RETRIEVED", latency: `${120 + Math.floor(Math.random() * 180)}ms` } : s));
        setEvidence(prev => [...prev, EVIDENCE[i]]);
      }, i * 380 + 560));
    });

    const total = INV_SOURCES.length * 380 + 900;
    delays.push(setTimeout(() => setPhase("CONFLICT_DETECTED"), total));

    return () => delays.forEach(clearTimeout);
  }, [phase]);

  // Auto-advance: conflict → policy
  useEffect(() => {
    if (phase !== "CONFLICT_DETECTED") return;
    const t = setTimeout(() => setPhase("POLICY_EVALUATED"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-advance: policy → resolution proposed
  useEffect(() => {
    if (phase !== "POLICY_EVALUATED") return;
    const t = setTimeout(() => setPhase("RESOLUTION_PROPOSED"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-advance: resolution proposed → awaiting approval
  useEffect(() => {
    if (phase !== "RESOLUTION_PROPOSED") return;
    const t = setTimeout(() => setPhase("AWAITING_APPROVAL"), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  // Execution log animation
  useEffect(() => {
    if (phase !== "EXECUTING") return;
    const log = failMode ? EXECUTION_LOG_FAIL : EXECUTION_LOG_NORMAL;
    setExecLog([]);
    setLogComplete(false);
    log.forEach((line, i) => {
      setTimeout(() => {
        setExecLog(prev => [...prev, line]);
        if (i === log.length - 1) {
          setTimeout(() => {
            setLogComplete(true);
            setTimeout(() => setPhase("VERIFYING"), 600);
          }, 400);
        }
      }, i * 280 + 200);
    });
  }, [phase, failMode]);

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [execLog]);

  // Verification auto-advance
  useEffect(() => {
    if (phase !== "VERIFYING") return;
    const t = setTimeout(() => {
      setPhase(failMode ? "VERIFICATION_FAILED" : "RESOLVED");
    }, 2800);
    return () => clearTimeout(t);
  }, [phase, failMode]);

  function stepStatus(stepIdx: number): "done" | "active" | "error" | "pending" {
    const isError = (phase === "REJECTED" && stepIdx === 5) ||
      (phase === "VERIFICATION_FAILED" && stepIdx === 7) ||
      (phase === "ESCALATED" && stepIdx === 8);
    if (isError) return "error";
    if (stepIdx < currentStep) return "done";
    if (stepIdx === currentStep) return "active";
    return "pending";
  }

  // ─── Phase Content ───────────────────────────────────────────────────────

  function renderPhaseContent() {
    switch (phase) {
      case "INTAKE": return <IntakePanel onStart={() => setPhase("INVESTIGATING")} />;
      case "INVESTIGATING": return <InvestigatingPanel sources={sources} />;
      case "CONFLICT_DETECTED": return <ConflictPanel />;
      case "POLICY_EVALUATED": return <PolicyPanel />;
      case "RESOLUTION_PROPOSED": return <ResolutionPanel />;
      case "AWAITING_APPROVAL": return <ApprovalPanel onApprove={() => setPhase("EXECUTING")} onReject={() => setPhase("REJECTED")} />;
      case "REJECTED": return <RejectedPanel onReset={reset} />;
      case "EXECUTING": return <ExecutionPanel log={execLog} complete={logComplete} logRef={logRef} />;
      case "VERIFYING": return <VerifyingPanel />;
      case "RESOLVED": return <ResolvedPanel />;
      case "VERIFICATION_FAILED": return <VerificationFailedPanel onEscalate={() => setPhase("ESCALATED")} />;
      case "ESCALATED": return <EscalatedPanel onReset={reset} />;
      default: return null;
    }
  }

  const isTerminal = phase === "RESOLVED" || phase === "ESCALATED" || phase === "REJECTED";
  const phaseLabel: Record<Phase, string> = {
    INTAKE: "EXCEPTION DETECTED", INVESTIGATING: "INVESTIGATING",
    EVIDENCE_READY: "EVIDENCE READY", CONFLICT_DETECTED: "CONFLICT DETECTED",
    POLICY_EVALUATED: "POLICY EVALUATED", RESOLUTION_PROPOSED: "RESOLUTION PROPOSED",
    AWAITING_APPROVAL: "AWAITING AUTHORIZATION", REJECTED: "AUTHORIZATION REJECTED",
    EXECUTING: "EXECUTING", VERIFYING: "VERIFYING", RESOLVED: "VERIFIED RESOLUTION",
    VERIFICATION_FAILED: "VERIFICATION FAILED", ESCALATED: "ESCALATED",
  };
  const phaseColor: Partial<Record<Phase, string>> = {
    INTAKE: "text-cyan-400", INVESTIGATING: "text-cyan-400", EVIDENCE_READY: "text-cyan-400",
    CONFLICT_DETECTED: "text-amber-400", POLICY_EVALUATED: "text-violet-400",
    RESOLUTION_PROPOSED: "text-violet-400", AWAITING_APPROVAL: "text-amber-400",
    REJECTED: "text-red-400", EXECUTING: "text-cyan-400", VERIFYING: "text-cyan-400",
    RESOLVED: "text-emerald-400", VERIFICATION_FAILED: "text-red-400", ESCALATED: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
              <GitMerge size={11} className="text-primary-foreground" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-foreground">EDGECASE</span>
          </div>
          <span className="text-border">|</span>
          <span className="font-mono text-[11px] text-muted-foreground">{CASE_META.id}</span>
          <span className="text-[11px] text-muted-foreground/60 hidden sm:block truncate max-w-[240px]">{CASE_META.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[10px] tracking-widest font-medium ${phaseColor[phase] ?? "text-foreground/60"}`}>
            {phaseLabel[phase]}
          </span>
          {/* Demo controls */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-border">
            <button
              onClick={() => setFailMode(f => !f)}
              className={`text-[10px] font-mono tracking-wider px-2 py-1 rounded border transition-colors ${failMode ? "border-red-500/40 text-red-400 bg-red-500/8" : "border-border text-muted-foreground/60 hover:text-muted-foreground"}`}
            >
              {failMode ? "FAIL MODE ●" : "FAIL MODE ○"}
            </button>
            {isTerminal && (
              <button onClick={reset} className="text-[10px] font-mono tracking-wider px-2 py-1 rounded border border-border text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1">
                <RotateCcw size={9} /> RESET
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Pipeline sidebar */}
        <aside className="w-48 shrink-0 border-r border-border px-3 py-4 overflow-y-auto hidden md:flex flex-col gap-0.5">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-3 px-1">RESOLUTION PIPELINE</p>
          {PIPELINE.map((step, idx) => {
            const st = stepStatus(idx);
            return (
              <div key={step.id} className="flex items-start gap-2 px-1 py-1.5 rounded">
                <div className="mt-0.5 shrink-0">
                  {st === "done" && <CheckCircle2 size={13} className="text-emerald-500" />}
                  {st === "active" && (
                    <div className="w-[13px] h-[13px] rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                  {st === "error" && <XCircle size={13} className="text-red-500" />}
                  {st === "pending" && <div className="w-[13px] h-[13px] rounded-full border border-border/40" />}
                </div>
                <span className={`text-[11px] leading-tight ${st === "active" ? "text-foreground font-medium" : st === "done" ? "text-foreground/60" : st === "error" ? "text-red-400" : "text-muted-foreground/40"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}

          {/* Connector lines between steps */}
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-0">
            {renderPhaseContent()}
          </div>
        </main>

        {/* Evidence panel (shows after investigation begins) */}
        {evidence.length > 0 && (
          <aside className="w-64 shrink-0 border-l border-border overflow-y-auto hidden lg:block">
            <div className="px-3 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">EVIDENCE</p>
                <Tag color="slate">{evidence.length} sources</Tag>
              </div>
              <div className="space-y-2">
                {evidence.map((ev, i) => (
                  <EvidenceCard key={ev.id} item={ev} index={i} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Phase Panel Components ───────────────────────────────────────────────────

function SectionHeader({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="mt-0.5 text-muted-foreground/60">{icon}</div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border rounded bg-card p-4 ${className}`}>
      {children}
    </div>
  );
}

// ── INTAKE ────────────────────────────────────────────────────────────────────

function IntakePanel({ onStart }: { onStart: () => void }) {
  const [started, setStarted] = useState(false);

  function beginInvestigation() {
    setStarted(true);
    onStart();
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<AlertOctagon size={16} />}
        label="Exception Detected"
        sub="This case cannot be safely resolved through the standard workflow. EdgeCase has been activated."
      />

      {/* Case card */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] text-muted-foreground">{CASE_META.id}</span>
              <Tag color="amber">EXCEPTION</Tag>
              <Tag color="violet">{CASE_META.exceptionClass}</Tag>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{CASE_META.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-lg font-semibold text-foreground">${CASE_META.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-muted-foreground font-mono">case value</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px]">
          {[
            ["Customer", CASE_META.customer.name],
            ["Customer ID", CASE_META.customer.id],
            ["Tier", CASE_META.customer.tier],
            ["Customer Since", CASE_META.customer.since],
            ["Product", CASE_META.product],
            ["Replacement Order", CASE_META.replacementOrder],
            ["Freshworks Case", CASE_META.freshworksId],
            ["Opened", CASE_META.opened],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider">{k}</p>
              <p className="text-foreground/80 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Why this is an exception */}
      <Card className="border-amber-500/20 bg-amber-500/4">
        <p className="text-[10px] font-mono text-amber-400/70 tracking-widest mb-2">WHY STANDARD WORKFLOW CANNOT RESOLVE</p>
        <ul className="space-y-1.5">
          {[
            "Carrier reports delivery confirmed — customer disputes receipt",
            "Replacement order value ($1,249) exceeds standard agent authority cap ($500)",
            "Previous agent commitment creates an obligation not captured in current policy",
            "Multiple conflicting evidence sources require reconciliation before action",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-amber-200/70">
              <ChevronRight size={11} className="mt-0.5 shrink-0 text-amber-500/60" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <div className="pt-2">
        <button
          onClick={beginInvestigation}
          disabled={started}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-[12px] font-semibold tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {started ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {started ? "Initiating Investigation..." : "Begin Investigation"}
        </button>
      </div>
    </div>
  );
}

// ── INVESTIGATING ─────────────────────────────────────────────────────────────

function InvestigatingPanel({ sources }: { sources: InvSource[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Search size={16} />}
        label="Investigation"
        sub="Querying connected systems for relevant evidence. Evidence will accumulate in the panel on the right."
      />
      <Card>
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-3">SOURCES QUERIED</p>
        <div className="space-y-1.5">
          {sources.map(src => (
            <div key={src.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
              <div className="w-[22px] shrink-0 flex justify-center">
                {src.status === "PENDING" && <div className="w-2 h-2 rounded-full border border-border" />}
                {src.status === "QUERYING" && <Loader2 size={12} className="text-cyan-400 animate-spin" />}
                {src.status === "RETRIEVED" && <CheckCircle2 size={13} className="text-emerald-500" />}
                {src.status === "FAILED" && <XCircle size={13} className="text-red-500" />}
              </div>
              <span className={`text-[11px] flex-1 ${src.status === "PENDING" ? "text-muted-foreground/40" : src.status === "QUERYING" ? "text-cyan-300" : "text-foreground/70"}`}>
                {src.name}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/40">{src.type}</span>
              {src.latency && <span className="font-mono text-[10px] text-emerald-500/60">{src.latency}</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── CONFLICT DETECTED ─────────────────────────────────────────────────────────

function ConflictPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<AlertTriangle size={16} />}
        label="Evidence Reconciled — Conflict Detected"
        sub="All 6 evidence sources retrieved. A material conflict was identified that prevents automatic resolution."
      />

      {/* Conflict visual */}
      <div className="border border-amber-500/30 rounded bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={13} className="text-amber-400" />
          <p className="text-[11px] font-mono text-amber-400 tracking-wider">DELIVERY CONFLICT</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-emerald-500/20 rounded p-3 bg-emerald-500/5">
            <p className="text-[10px] font-mono text-emerald-400/60 tracking-wider mb-1.5">SOURCE A — FedEx Tracking API</p>
            <p className="text-sm font-semibold text-emerald-400">DELIVERED</p>
            <p className="text-[11px] text-muted-foreground mt-1">20 Nov 2024 · 14:23 EST<br />Front door — no signature captured</p>
          </div>
          <div className="border border-red-500/20 rounded p-3 bg-red-500/5">
            <p className="text-[10px] font-mono text-red-400/60 tracking-wider mb-1.5">SOURCE B — Customer Statement</p>
            <p className="text-sm font-semibold text-red-400">NOT RECEIVED</p>
            <p className="text-[11px] text-muted-foreground mt-1">22 Nov 2024 · 08:17 UTC<br />Denies any delivery at address</p>
          </div>
        </div>
      </div>

      {/* Secondary conflict */}
      <div className="border border-violet-500/20 rounded bg-violet-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={13} className="text-violet-400" />
          <p className="text-[11px] font-mono text-violet-400 tracking-wider">COMMITMENT VS POLICY CONFLICT</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Agent Lena R. made an explicit commitment to resolution in CS-8821 (15 Nov 2024).
          Current policy POL-2024-CS-07 §3.2 requires Supervisor approval for second replacements
          above $800 — authorization was not obtained at time of commitment.
        </p>
      </div>

      <Card className="bg-secondary/40">
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-2">RECONCILIATION SUMMARY</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Sources Retrieved", value: "6 / 6", color: "text-emerald-400" },
            { label: "Conflicts Identified", value: "2", color: "text-amber-400" },
            { label: "Evidence Quality", value: "HIGH", color: "text-cyan-400" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-base font-semibold font-mono ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground/60">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
        <Loader2 size={10} className="animate-spin" />
        Evaluating applicable policy…
      </div>
    </div>
  );
}

// ── POLICY EVALUATED ──────────────────────────────────────────────────────────

function PolicyPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<BookOpen size={16} />}
        label="Policy Evaluated"
        sub="Applicable policies and authority constraints have been identified."
      />
      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider mb-1">APPLICABLE POLICY</p>
            <p className="font-semibold text-foreground text-sm">POL-2024-CS-07 — Second Replacement Policy</p>
          </div>
          <Tag color="violet">BINDING</Tag>
        </div>
        <div className="space-y-2 text-[11px]">
          {[
            { rule: "§3.1 — Authority cap", value: "Agent authority limited to $500 per action" },
            { rule: "§3.2 — High-value threshold", value: "Second replacements > $800 require Supervisor approval" },
            { rule: "§3.4 — Commitment clause", value: "Documented agent commitments are honoured where evidence supports" },
            { rule: "§4.1 — Customer tier", value: "Business tier customers eligible for enhanced resolution options" },
          ].map(({ rule, value }) => (
            <div key={rule} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
              <span className="font-mono text-muted-foreground/50 shrink-0 w-36">{rule}</span>
              <span className="text-foreground/70">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-emerald-500/20 bg-emerald-500/4">
          <p className="text-[10px] font-mono text-emerald-400/70 tracking-wider mb-2">PERMITTED ACTIONS</p>
          <ul className="space-y-1">
            {["Issue account credit ≤ $1,500 (with Supervisor approval)", "Update case record", "Notify customer"].map(a => (
              <li key={a} className="flex items-center gap-1.5 text-[11px] text-emerald-300/70">
                <Check size={10} className="shrink-0" />{a}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-red-500/20 bg-red-500/4">
          <p className="text-[10px] font-mono text-red-400/70 tracking-wider mb-2">PROHIBITED / REQUIRES AUTHORITY</p>
          <ul className="space-y-1">
            {["Issue second physical replacement without approval", "Exceed $1,500 without VP sign-off", "Mark resolved without verification"].map(a => (
              <li key={a} className="flex items-center gap-1.5 text-[11px] text-red-300/70">
                <X size={10} className="shrink-0" />{a}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
        <Loader2 size={10} className="animate-spin" />
        Generating resolution proposal…
      </div>
    </div>
  );
}

// ── RESOLUTION PROPOSED ───────────────────────────────────────────────────────

function ResolutionPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Activity size={16} />}
        label="Resolution Proposed"
        sub="EdgeCase has determined a policy-compliant resolution. Human authorization is required before execution."
      />

      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider mb-1">PROPOSED ACTION</p>
            <p className="text-sm font-semibold text-foreground">Issue Account Credit — $1,249.00</p>
          </div>
          <Tag color="amber">APPROVAL REQUIRED</Tag>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">JUSTIFICATION</p>
          {[
            "Carrier delivery unverified — no signature captured, disputed by customer",
            "3-year Business-tier customer with clean fraud history (score: 4.6/5)",
            "Documented agent commitment (CS-8821) creates obligation to resolve",
            "Account credit eliminates dispute without issuing additional physical unit",
            "Credit amount within policy ceiling (≤$1,500) — requires Supervisor approval",
          ].map((j, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground/70">
              <ArrowRight size={10} className="mt-0.5 shrink-0 text-muted-foreground/40" />
              {j}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          {[
            { label: "Action", value: "ISSUE_CREDIT", mono: true },
            { label: "Amount", value: "$1,249.00", mono: false },
            { label: "Risk Level", value: "MEDIUM", mono: true },
            { label: "Target", value: "CUST-18823", mono: true },
            { label: "Policy Ref", value: "POL-2024-CS-07", mono: true },
            { label: "Auth Required", value: "Supervisor", mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">{label}</p>
              <p className={`text-[11px] text-foreground/80 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
        <Loader2 size={10} className="animate-spin" />
        Awaiting authorization boundary…
      </div>
    </div>
  );
}

// ── AWAITING APPROVAL ─────────────────────────────────────────────────────────

function ApprovalPanel({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  const [decision, setDecision] = useState<null | "approve" | "reject">(null);

  function handleApprove() {
    setDecision("approve");
    setTimeout(onApprove, 400);
  }
  function handleReject() {
    setDecision("reject");
    setTimeout(onReject, 400);
  }

  return (
    <div className="space-y-4">
      {/* Authority boundary banner */}
      <div className="border border-amber-500/40 rounded bg-amber-500/6 px-4 py-3 flex items-center gap-3">
        <ShieldAlert size={18} className="text-amber-400 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-amber-300">Authorization Boundary</p>
          <p className="text-[11px] text-amber-200/60 mt-0.5">EdgeCase has paused at an explicit authority boundary. Human approval is required before the action can proceed.</p>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider mb-1">PROPOSED ACTION</p>
          <p className="text-base font-semibold text-foreground">Issue account credit of $1,249.00 to CUST-18823</p>
          <p className="text-[11px] text-muted-foreground mt-1">ProBook X7 — Mariana Pereira — Case EC-1042</p>
        </div>

        <div className="border border-border rounded p-3 bg-secondary/40 mb-4">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider mb-2">AUTHORITY CHECK</p>
          <div className="flex items-center gap-2 text-[11px]">
            <XCircle size={12} className="text-red-400 shrink-0" />
            <span className="text-foreground/70">Agent authority cap: $500 — <span className="text-red-400">exceeded</span></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-1.5">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span className="text-foreground/70">Policy POL-2024-CS-07 §3.2 — Supervisor approval sufficient for $1,249</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-1.5">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span className="text-foreground/70">Evidence supports resolution — 6 sources retrieved, commitment on record</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[11px] text-muted-foreground/70 mb-3">
            As the authorizing Supervisor, you are approving a $1,249.00 account credit in resolution of case EC-1042.
            This action will be executed and verified. Your decision will be logged.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={decision !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded text-[12px] font-semibold tracking-wide hover:bg-emerald-500 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {decision === "approve" ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
              Approve & Execute
            </button>
            <button
              onClick={handleReject}
              disabled={decision !== null}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-500/40 text-red-400 rounded text-[12px] font-semibold tracking-wide hover:bg-red-500/8 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              <X size={13} />
              Reject
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── REJECTED ──────────────────────────────────────────────────────────────────

function RejectedPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<XCircle size={16} />}
        label="Authorization Rejected"
        sub="The proposed action was rejected by the authorizing supervisor."
      />
      <div className="border border-red-500/30 rounded bg-red-500/5 p-4 space-y-3">
        <Tag color="red">AUTHORIZATION REJECTED</Tag>
        <p className="text-[11px] text-foreground/70 leading-relaxed">
          The resolution was not authorized. Case EC-1042 cannot proceed to autonomous execution.
          EdgeCase has recorded the rejection and the case has been escalated for manual review.
        </p>
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider mb-1">OUTCOME</p>
          <p className="font-mono text-sm text-red-400">HUMAN_ESCALATION</p>
          <p className="text-[11px] text-muted-foreground mt-1">Case EC-1042 requires human-led resolution. All evidence and the resolution proposal have been preserved for the next reviewer.</p>
        </div>
      </div>
      <button onClick={onReset} className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1.5 transition-colors">
        <RotateCcw size={11} /> Reset demo
      </button>
    </div>
  );
}

// ── EXECUTING ─────────────────────────────────────────────────────────────────

function ExecutionPanel({ log, complete, logRef }: { log: string[]; complete: boolean; logRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Zap size={16} />}
        label="Executing Authorized Action"
        sub="Performing controlled side effect through Billing API. Freshworks case being updated."
      />
      <Card>
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-3">ACTION EXECUTION LOG</p>
        <div
          ref={logRef}
          className="font-mono text-[11px] bg-black/40 rounded p-3 min-h-[140px] max-h-52 overflow-y-auto space-y-0.5"
        >
          {log.map((line, i) => (
            <p
              key={i}
              className={`leading-relaxed ${line.startsWith("←") ? "text-cyan-400" : line.startsWith("✓") ? "text-emerald-400" : "text-foreground/50"}`}
            >
              {line}
            </p>
          ))}
          {!complete && (
            <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse" />
          )}
        </div>
      </Card>
    </div>
  );
}

// ── VERIFYING ─────────────────────────────────────────────────────────────────

function VerifyingPanel() {
  const [checks, setChecks] = useState<string[]>([]);
  const checkItems = [
    "Querying Billing API → account CUST-18823…",
    "Confirmed credit CRED-20241122-8831 present",
    "Verifying credit amount matches $1,249.00…",
    "Amount confirmed — PASS",
    "Checking Freshworks case CS-8821 status…",
    "Case marked PENDING_VERIFICATION — PASS",
    "Running post-action consistency check…",
  ];

  useEffect(() => {
    checkItems.forEach((item, i) => {
      setTimeout(() => setChecks(prev => [...prev, item]), i * 320 + 100);
    });
  }, []);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Eye size={16} />}
        label="Independent Verification"
        sub="EdgeCase is independently confirming the intended business outcome — not trusting the execution response alone."
      />
      <Card>
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-3">VERIFICATION CHECKS</p>
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              {c.includes("PASS") ? <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> : <Loader2 size={11} className="text-cyan-400 animate-spin shrink-0" />}
              <span className={c.includes("PASS") ? "text-emerald-300/80" : "text-foreground/60"}>{c}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── RESOLVED ──────────────────────────────────────────────────────────────────

function ResolvedPanel() {
  return (
    <div className="space-y-4">
      {/* Primary resolved banner */}
      <div className="border border-emerald-500/40 rounded bg-emerald-500/6 p-5">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={20} className="text-emerald-400" />
          <div>
            <p className="font-mono text-[10px] text-emerald-400/60 tracking-wider">EDGECASE · {CASE_META.id}</p>
            <p className="text-base font-semibold text-emerald-300">VERIFIED RESOLUTION</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Exception detected", done: true },
            { label: "Evidence reconciled — 6 sources, 2 conflicts identified", done: true },
            { label: "Resolution authorized by Supervisor", done: true },
            { label: "Account credit $1,249.00 issued (CRED-20241122-8831)", done: true },
            { label: "Outcome independently verified", done: true },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2 text-[12px]">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-200/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Outcome record */}
      <Card>
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-3">RESOLUTION RECORD</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
          {[
            ["Case", "EC-1042"],
            ["Freshworks", "CS-8821"],
            ["Customer", "Mariana Pereira (CUST-18823)"],
            ["Action Taken", "Account credit issued"],
            ["Credit ID", "CRED-20241122-8831"],
            ["Amount", "$1,249.00"],
            ["Policy", "POL-2024-CS-07 §3.2"],
            ["Authorized By", "Supervisor (this session)"],
            ["Verification", "PASS — independent API check"],
            ["Final State", "RESOLVED"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider">{k}</p>
              <p className="text-foreground/80 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-secondary/40">
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-2">PRODUCT VALUE DELIVERED</p>
        <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
          {[
            { value: "6", label: "Systems coordinated", color: "text-cyan-400" },
            { value: "2", label: "Conflicts resolved", color: "text-amber-400" },
            { value: "~45 min", label: "Human effort saved", color: "text-emerald-400" },
          ].map(({ value, label, color }) => (
            <div key={label}>
              <p className={`text-lg font-semibold font-mono ${color}`}>{value}</p>
              <p className="text-muted-foreground/50">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── VERIFICATION FAILED ───────────────────────────────────────────────────────

function VerificationFailedPanel({ onEscalate }: { onEscalate: () => void }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<XCircle size={16} />}
        label="Verification Failed"
        sub="The post-action verification check did not confirm the expected business state. EdgeCase will not declare success."
      />
      <div className="border border-red-500/30 rounded bg-red-500/5 p-4 space-y-3">
        <Tag color="red">VERIFICATION_FAILED</Tag>
        <div className="space-y-1.5 text-[11px]">
          {[
            { check: "Credit CRED-20241122-8831 present", result: "PASS", pass: true },
            { check: "Credit amount matches $1,249.00", result: "FAIL — amount shows $0.00 (possible processing delay or rollback)", pass: false },
            { check: "Freshworks case status PENDING_VERIFICATION", result: "PASS", pass: true },
          ].map(({ check, result, pass }) => (
            <div key={check} className="flex items-start gap-2">
              {pass ? <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 shrink-0" /> : <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />}
              <span className={pass ? "text-foreground/70" : "text-red-300/80"}>{check} — {result}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/4">
        <p className="text-[10px] font-mono text-amber-400/70 tracking-wider mb-2">EDGECASE DOES NOT DECLARE SUCCESS</p>
        <p className="text-[11px] text-foreground/70 leading-relaxed">
          An API success response was received but independent verification of the business state failed.
          EdgeCase will not mark this case RESOLVED. The case is being escalated with the full evidence
          record for human review.
        </p>
      </Card>

      <button
        onClick={onEscalate}
        className="flex items-center gap-2 px-4 py-2 border border-amber-500/40 text-amber-400 rounded text-[12px] font-semibold tracking-wide hover:bg-amber-500/8 active:scale-[0.97] transition-all"
      >
        <AlertOctagon size={13} />
        Escalate with Evidence Record
      </button>
    </div>
  );
}

// ── ESCALATED ─────────────────────────────────────────────────────────────────

function EscalatedPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-4">
      <div className="border border-amber-500/30 rounded bg-amber-500/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <AlertOctagon size={20} className="text-amber-400" />
          <div>
            <p className="font-mono text-[10px] text-amber-400/60 tracking-wider">EDGECASE · {CASE_META.id}</p>
            <p className="text-base font-semibold text-amber-300">JUSTIFIED ESCALATION</p>
          </div>
        </div>
        <div className="space-y-3 text-[11px]">
          <div>
            <p className="font-mono text-muted-foreground/50 text-[10px] tracking-wider mb-1">WHAT WAS DISCOVERED</p>
            <p className="text-foreground/70 leading-relaxed">6 evidence sources retrieved. Carrier confirms delivery (20 Nov, 14:23). Customer disputes receipt. Agent commitment on record (CS-8821). Credit action executed and acknowledged by Billing API.</p>
          </div>
          <div>
            <p className="font-mono text-muted-foreground/50 text-[10px] tracking-wider mb-1">WHAT REMAINS UNCERTAIN</p>
            <p className="text-foreground/70 leading-relaxed">Post-action credit verification returned amount $0.00 — possible processing delay, API inconsistency, or rollback. Business outcome cannot be confirmed.</p>
          </div>
          <div>
            <p className="font-mono text-muted-foreground/50 text-[10px] tracking-wider mb-1">WHY AUTONOMOUS RESOLUTION STOPPED</p>
            <p className="text-foreground/70 leading-relaxed">DP-07 (Verification is Part of Resolution): EdgeCase requires confirmed business state. Independent verification failed. Declaring RESOLVED without confirmation would violate the safety model.</p>
          </div>
          <div>
            <p className="font-mono text-muted-foreground/50 text-[10px] tracking-wider mb-1">WHAT THE HUMAN NEEDS TO DO</p>
            <p className="text-foreground/70 leading-relaxed">Verify credit status in Billing system for CUST-18823. If credit confirmed, mark RESOLVED manually. If credit absent, re-execute or contact Billing Operations. All evidence preserved in this record.</p>
          </div>
        </div>
      </div>

      <Card className="bg-secondary/40">
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest mb-2">ESCALATION RECORD</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
          {[
            ["Case", "EC-1042"],
            ["Escalation Reason", "VERIFICATION_FAILED"],
            ["Credit ID", "CRED-20241122-8831"],
            ["Billing API Response", "201 Created (unconfirmed)"],
            ["Verification Result", "FAIL — amount mismatch"],
            ["Final State", "HUMAN_ESCALATION"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider">{k}</p>
              <p className="text-foreground/80 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <button onClick={onReset} className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1.5 transition-colors">
        <RotateCcw size={11} /> Reset demo
      </button>
    </div>
  );
}
