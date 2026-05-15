'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ArrowLeft, Phone, Brain, Flag, Shield, Headphones,
    Play, Pause, PhoneIncoming, PhoneOutgoing, Globe, DollarSign, Clock,
    MessageSquare, Cpu, Mic, Volume2, Zap, ExternalLink, Timer,
    CheckCircle, AlertTriangle, XCircle, User, Bot,
} from 'lucide-react';
import { useCallDetail } from '../hooks/useCallDetail';
import { ErrorBanner } from '../components/ErrorBanner';
import { aiCallService } from '../services/aiCallService';

const fmtDur = (s: number | null) => { if (!s) return '—'; const m = Math.floor(s / 60), r = s % 60; return m > 0 ? `${m}m ${r}s` : `${r}s`; };
const fmtTime = (s: number) => { const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${m}:${r.toString().padStart(2, '0')}`; };

const STATUS_CFG: Record<string, { gradient: string; icon: React.FC<{className?:string; style?: React.CSSProperties}>; label: string }> = {
    green: { gradient: 'from-emerald-600 to-emerald-700', icon: CheckCircle, label: 'Successful' },
    yellow: { gradient: 'from-slate-600 to-slate-700', icon: AlertTriangle, label: 'Needs Review' },
    red: { gradient: 'from-slate-700 to-slate-800', icon: XCircle, label: 'Failed' },
};

const TYPE_CFG: Record<string, { label: string; Icon: React.FC<{className?:string; style?: React.CSSProperties}> }> = {
    inboundPhoneCall: { label: 'Inbound Call', Icon: PhoneIncoming },
    outboundPhoneCall: { label: 'Outbound Call', Icon: PhoneOutgoing },
    webCall: { label: 'Web Call', Icon: Globe },
};

const BADGE_CLR: Record<string, string> = {
    positive: 'bg-emerald-100 text-emerald-700', negative: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700', successful: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700',
};

interface Props { callId: number | string; onBack?: () => void; }

export default function CallDetailPage({ callId, onBack }: Props) {
    const { data: call, loading, error, refetch } = useCallDetail(callId);

    if (loading) return (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6 animate-pulse space-y-4 pt-6">
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
    );
    if (error) return (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6 pt-6">
            {onBack && <BackBtn onClick={onBack} />}
            <ErrorBanner message={error} onRetry={refetch} autoRetrySeconds={10} />
        </div>
    );
    if (!call) return null;

    const d = call as any;
    const status = (STATUS_CFG[d.status_color] || STATUS_CFG.yellow)!;
    const StatusIcon = status.icon;
    const typeInfo = TYPE_CFG[d.call_type] || null;

    return (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-6 pb-10">
            {onBack && <BackBtn onClick={onBack} />}

            {/* ━━ Hero Banner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${status.gradient} p-6 text-white shadow-lg mb-6`}>
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/[0.04]" />
                <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-white/[0.03]" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                                    d.status_color === 'green' ? 'bg-emerald-400/25 text-emerald-100' :
                                    d.status_color === 'red' ? 'bg-red-400/25 text-red-200' :
                                    'bg-amber-400/20 text-amber-200'
                                }`}>
                                    <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                                </span>
                                {typeInfo && (
                                    <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">
                                        <typeInfo.Icon className="h-3 w-3" /> {typeInfo.label}
                                    </span>
                                )}
                                <span className="bg-white/10 rounded-full px-2.5 py-1 text-xs text-white/80 capitalize backdrop-blur-sm">
                                    {d.call_status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <h1 className="text-lg font-semibold mb-1 tracking-tight">
                                {d.caller_number || 'Unknown Caller'}
                            </h1>
                            <p className="text-white/50 text-xs">
                                {d.call_datetime ? new Date(d.call_datetime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                {d.started_at ? ` · ${new Date(d.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                {d.ended_reason ? ` · ${d.ended_reason.replace(/-/g, ' ')}` : ''}
                            </p>
                        </div>
                        <div className="flex gap-6 shrink-0">
                            <HeroStat icon={Clock} label="Duration" value={fmtDur(d.duration_seconds)} />
                            <HeroStat icon={Timer} label="Started" value={d.started_at ? new Date(d.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} />
                            <HeroStat icon={DollarSign} label="Cost" value={d.cost != null ? `$${Number(d.cost).toFixed(3)}` : '—'} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ━━ Main Layout ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left (2/3) ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* AI Summary */}
                    {d.summary && (
                        <Card title="AI Summary" icon={Brain} accent="indigo">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50">
                                <p className="text-sm text-slate-700 leading-relaxed">{d.summary}</p>
                            </div>
                        </Card>
                    )}

                    {/* Conversation */}
                    {d.messages?.length > 0 ? (
                        <Card title={`Conversation · ${d.messages.length} messages`} icon={MessageSquare} accent="blue">
                            <ChatBubbles messages={d.messages} />
                        </Card>
                    ) : d.transcript ? (
                        <Card title="Transcript" icon={MessageSquare} accent="blue">
                            <FallbackTranscript text={d.transcript} />
                        </Card>
                    ) : null}

                    {/* Recording */}
                    <Card title="Recording" icon={Headphones} accent="purple">
                        {d.has_recording ? <Player callId={d.id} /> : (
                            <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                                <Volume2 className="h-4 w-4" /> No recording available
                            </div>
                        )}
                    </Card>

                    {/* Cost Breakdown */}
                    {d.cost_breakdown && (
                        <Card title="Cost Breakdown" icon={DollarSign} accent="cyan">
                            <CostViz data={d.cost_breakdown} />
                        </Card>
                    )}
                </div>

                {/* ── Right (1/3) ─────────────────────────────── */}
                <div className="space-y-5">

                    <Card title="Call Info" icon={Phone} accent="blue" compact>
                        <InfoRows items={[
                            { k: 'Caller', v: d.caller_number || '—' },
                            ...(d.location_id ? [{ k: 'Location', v: d.location_id, mono: true }] : []),
                            { k: 'Agent', v: d.agent_id ? `${d.agent_id.slice(0, 8)}…` : '—', mono: true },
                            { k: 'Date/Time', v: d.call_datetime ? new Date(d.call_datetime).toLocaleString() : '—' },
                            { k: 'Duration', v: fmtDur(d.duration_seconds) },
                            { k: 'Ended', v: d.ended_reason?.replace(/-/g, ' ').replace(/\./g, ' › ') || '—' },
                        ]} />
                    </Card>

                    <Card title="AI Analysis" icon={Brain} accent="violet" compact>
                        <div className="space-y-1.5">
                            <Badge label="Sentiment" value={d.sentiment} />
                            <Badge label="Intent" value={d.customer_intent?.replace(/_/g, ' ')} />
                            <Badge label="Emotion" value={d.emotion || 'neutral'} />
                            <Badge label="Success" value={d.success_status} />
                            {d.success_score != null && <ScoreBar score={d.success_score} />}
                        </div>
                    </Card>

                    <Card title="Actions & Issues" icon={Flag} accent="orange" compact>
                        <InfoRows items={[
                            { k: 'Action', v: Array.isArray(d.action_taken) ? d.action_taken.join(', ') : (d.action_taken || 'None') },
                            { k: 'Issue', v: d.issue_detected?.replace(/_/g, ' ') || 'none' },
                            { k: 'Follow-up', v: d.follow_up_required ? '⚠️ Required' : 'No', warn: d.follow_up_required },
                            ...(d.follow_up_reason ? [{ k: 'Reason', v: d.follow_up_reason }] : []),
                        ]} />
                    </Card>

                    {d.tech_stack && (
                        <Card title="Tech Stack" icon={Cpu} accent="slate" compact>
                            <div className="space-y-2">
                                {d.tech_stack.llm_model && <TechPill icon={Zap} color="#f59e0b" label="LLM" value={`${d.tech_stack.llm_model}`} sub={d.tech_stack.llm_provider} />}
                                {d.tech_stack.stt_model && <TechPill icon={Mic} color="#3b82f6" label="STT" value={`${d.tech_stack.stt_model}`} sub={d.tech_stack.stt_provider} />}
                                {d.tech_stack.tts_model && <TechPill icon={Volume2} color="#8b5cf6" label="TTS" value={`${d.tech_stack.tts_model}`} sub={d.tech_stack.tts_provider} />}
                            </div>
                        </Card>
                    )}

                    <Card title="System" icon={Shield} accent="slate" compact>
                        <div className="text-xs text-slate-500 space-y-1.5">
                            <p><span className="font-medium text-slate-600">Ref:</span> #{String(d.id).padStart(4, '0')}</p>
                            <p className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-600">Health:</span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    d.status_color === 'green' ? 'bg-emerald-50 text-emerald-700' :
                                    d.status_color === 'red' ? 'bg-red-50 text-red-700' :
                                    'bg-amber-50 text-amber-700'
                                }`}>{d.status_color === 'green' ? 'Healthy' : d.status_color === 'red' ? 'Critical' : 'Review'}</span>
                            </p>
                            {d.log_url && (
                                <a href={d.log_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline mt-2">
                                    <ExternalLink className="h-3 w-3" /> View Call Logs
                                </a>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ━━ Sub Components ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BackBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>
    );
}

function HeroStat({ icon: I, label, value }: { icon: React.FC<{className?:string; style?: React.CSSProperties}>; label: string; value: string }) {
    return (
        <div className="text-center min-w-[60px]">
            <I className="h-4 w-4 text-white/60 mx-auto mb-1" />
            <p className="text-sm font-bold">{value}</p>
            <p className="text-[9px] text-white/50 uppercase tracking-wider">{label}</p>
        </div>
    );
}

const ACCENT: Record<string, string> = {
    indigo: 'border-l-indigo-400', blue: 'border-l-blue-400', purple: 'border-l-purple-400',
    cyan: 'border-l-cyan-400', violet: 'border-l-violet-400', orange: 'border-l-orange-400', slate: 'border-l-slate-300',
};

function Card({ title, icon: I, accent, children, compact }: {
    title: string; icon: React.FC<{className?:string; style?: React.CSSProperties}>; accent: string; children: React.ReactNode; compact?: boolean;
}) {
    return (
        <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${ACCENT[accent] || ''}`}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
                <I className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</h3>
            </div>
            <div className={compact ? 'p-4' : 'p-5'}>{children}</div>
        </div>
    );
}

function InfoRows({ items }: { items: { k: string; v: string; mono?: boolean; warn?: boolean }[] }) {
    return (
        <div className="space-y-2">
            {items.map((i, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3">
                    <span className="text-[11px] text-slate-400 shrink-0">{i.k}</span>
                    <span className={`text-[11px] text-right font-medium ${i.warn ? 'text-orange-600 font-bold' : i.mono ? 'font-mono text-slate-500 text-[10px]' : 'text-slate-700'}`}>{i.v}</span>
                </div>
            ))}
        </div>
    );
}

function Badge({ label, value }: { label: string; value: string }) {
    const cls = BADGE_CLR[value] || 'bg-slate-100 text-slate-600';
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-slate-400">{label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${cls}`}>{value.replace(/_/g, ' ')}</span>
        </div>
    );
}

function ScoreBar({ score }: { score: number }) {
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    return (
        <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Score</span>
                <span className="text-xs font-bold" style={{ color }}>{score}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function TechPill({ icon: I, color, label, value, sub }: { icon: React.FC<{className?:string; style?: React.CSSProperties}>; color: string; label: string; value: string; sub: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <I className="h-3.5 w-3.5 shrink-0" style={{ color }} />
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-700">{value}</p>
                <p className="text-[9px] text-slate-400">{label} · {sub}</p>
            </div>
        </div>
    );
}

// ━━ Chat Bubbles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ChatBubbles({ messages }: { messages: { role: string; content: string; time: number | null }[] }) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? messages : messages.slice(0, 14);
    const hasMore = messages.length > 14;

    return (
        <div>
            {/* Conversation header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        AI Assistant
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Caller
                    </span>
                </div>
                <span className="text-[10px] text-slate-400">{messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                {visible.map((m, i) => {
                    const isBot = m.role === 'bot' || m.role === 'assistant';
                    return (
                        <div key={i} className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                            {/* Avatar */}
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 shadow-sm ${
                                isBot ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                            }`}>
                                {isBot ? <Bot className="h-3.5 w-3.5 text-white" /> : <User className="h-3.5 w-3.5 text-white" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[78%] ${isBot ? '' : 'flex flex-col items-end'}`}>
                                {/* Role label */}
                                <div className={`flex items-center gap-1.5 mb-1 ${isBot ? '' : 'flex-row-reverse'}`}>
                                    <span className={`text-[10px] font-semibold ${isBot ? 'text-indigo-500' : 'text-slate-500'}`}>
                                        {isBot ? 'AI Assistant' : 'Caller'}
                                    </span>
                                    {m.time != null && (
                                        <span className="text-[9px] text-slate-300 tabular-nums">{fmtTime(m.time)}</span>
                                    )}
                                </div>

                                {/* Message body */}
                                <div className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                                    isBot
                                        ? 'bg-white border border-indigo-100 text-slate-700 rounded-tl-sm'
                                        : 'bg-indigo-600 text-white rounded-tr-sm'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Expand button */}
            {hasMore && (
                <button onClick={() => setExpanded(!expanded)}
                    className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-semibold py-2.5 mt-2 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                    {expanded ? '▲ Show less' : `▼ Show all ${messages.length} messages`}
                </button>
            )}
        </div>
    );
}

function FallbackTranscript({ text }: { text: string }) {
    const lines = text.split('\n').filter(l => l.trim());
    return (
        <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            {lines.map((line, i) => {
                const isAI = line.startsWith('AI:');
                const content = line.replace(/^(AI|User):\s*/, '');
                return (
                    <div key={i} className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 shadow-sm ${
                            isAI ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                            {isAI ? <Bot className="h-3 w-3 text-white" /> : <User className="h-3 w-3 text-white" />}
                        </div>
                        <div className={`max-w-[78%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                            <span className={`text-[10px] font-semibold mb-0.5 ${isAI ? 'text-indigo-500' : 'text-slate-500'}`}>
                                {isAI ? 'AI Assistant' : 'Caller'}
                            </span>
                            <div className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${
                                isAI ? 'bg-white border border-indigo-100 text-slate-700 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm'
                            }`}>
                                {content}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ━━ Cost Visualization ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CostViz({ data }: { data: Record<string, number> }) {
    const total = data.total || Object.values(data).reduce((s, v) => s + v, 0);
    const items = [
        { key: 'llm', label: 'Language Model', color: '#f59e0b', icon: Zap },
        { key: 'stt', label: 'Speech-to-Text', color: '#3b82f6', icon: Mic },
        { key: 'tts', label: 'Text-to-Speech', color: '#8b5cf6', icon: Volume2 },
        { key: 'vapi', label: 'Vapi Platform', color: '#06b6d4', icon: Cpu },
        { key: 'transport', label: 'Transport', color: '#64748b', icon: Phone },
    ].filter(i => (data[i.key] ?? 0) > 0);

    return (
        <div className="space-y-4">
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                {items.map(i => (
                    <div key={i.key} className="transition-all hover:opacity-80" style={{ width: `${((data[i.key]||0)/total)*100}%`, backgroundColor: i.color }}
                        title={`${i.label}: $${data[i.key]?.toFixed(4)}`} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {items.map(i => {
                    const pct = total > 0 ? Math.round(((data[i.key] || 0) / total) * 100) : 0;
                    return (
                        <div key={i.key} className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                            <i.icon className="h-3.5 w-3.5 shrink-0" style={{ color: i.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-slate-600 truncate">{i.label}</p>
                                <p className="text-xs font-bold text-slate-800">${data[i.key]?.toFixed(4)}<span className="text-slate-400 font-normal ml-1">({pct}%)</span></p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-900">Total: ${total.toFixed(4)}</span>
            </div>
        </div>
    );
}

// ━━ Recording Player ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Player({ callId }: { callId: number }) {
    const ref = useRef<HTMLAudioElement>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const [prog, setProg] = useState(0);
    const [dur, setDur] = useState(0);

    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

    const play = useCallback(async () => {
        const a = ref.current; if (!a) return;
        setLoading(true); setErr(false);
        try {
            if (!url) { const u = await aiCallService.fetchRecordingBlob(callId); setUrl(u); a.src = u; }
            await a.play();
        } catch { setErr(true); setLoading(false); }
    }, [callId, url]);

    const toggle = useCallback(() => { const a = ref.current; if (!a) return; playing ? a.pause() : play(); }, [playing, play]);
    const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const a = ref.current; if (!a?.duration) return; a.currentTime = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * a.duration; }, []);

    return (
        <div>
            <audio ref={ref} preload="none"
                onPlay={() => { setPlaying(true); setLoading(false); }} onPause={() => setPlaying(false)}
                onEnded={() => { setPlaying(false); setProg(0); }}
                onTimeUpdate={() => { const a = ref.current; if (a?.duration) setProg((a.currentTime / a.duration) * 100); }}
                onLoadedMetadata={() => setDur(ref.current?.duration || 0)}
                onError={() => { setErr(true); setLoading(false); setPlaying(false); }} />
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <button onClick={toggle} disabled={err}
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm shrink-0 transition-all ${err ? 'bg-slate-200 text-slate-400' : playing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <div className="flex-1 space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full cursor-pointer overflow-hidden group" onClick={seek}>
                        <div className="h-full bg-indigo-500 rounded-full transition-all group-hover:bg-indigo-600" style={{ width: `${prog}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 tabular-nums">
                        <span>{dur > 0 ? fmtTime((prog / 100) * dur) : '0:00'}</span>
                        <span>{dur > 0 ? fmtTime(dur) : '—'}</span>
                    </div>
                </div>
            </div>
            {err && <p className="text-xs text-red-500 mt-2">Unable to load recording.</p>}
        </div>
    );
}
