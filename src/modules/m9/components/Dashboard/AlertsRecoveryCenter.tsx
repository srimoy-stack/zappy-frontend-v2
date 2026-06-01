import React from 'react';
import { 
    AlertTriangle, 
    RefreshCcw, 
    Check, 
    XCircle, 
    WifiOff, 
    FileWarning, 
    CreditCard, 
    Activity 
} from 'lucide-react';
import { OperationalAlert } from '../../types/dashboard';
import { cn } from '@/utils';

interface AlertsRecoveryCenterProps {
    alerts: OperationalAlert[];
    onRetry: (alertId: string) => void;
    onResolve: (alertId: string) => void;
    onAcknowledge: (alertId: string) => void;
}

export const AlertsRecoveryCenter: React.FC<AlertsRecoveryCenterProps> = ({
    alerts,
    onRetry,
    onResolve,
    onAcknowledge
}) => {
    const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'acknowledged');

    const getAlertIcon = (type: OperationalAlert['type']) => {
        switch (type) {
            case 'pos_disconnect':
                return <WifiOff className="w-5 h-5 text-rose-500" />;
            case 'sync_fail':
                return <RefreshCcw className="w-5 h-5 text-amber-500" />;
            case 'payment_fail':
                return <CreditCard className="w-5 h-5 text-rose-500" />;
            case 'menu_publish_fail':
                return <FileWarning className="w-5 h-5 text-amber-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-slate-500" />;
        }
    };

    const getSeverityStyles = (severity: OperationalAlert['severity'], status: OperationalAlert['status']) => {
        if (status === 'acknowledged') {
            return 'bg-slate-50/50 border-slate-200 opacity-60';
        }
        switch (severity) {
            case 'critical':
                return 'bg-rose-50/70 border-rose-100/80 shadow-rose-500/5 hover:bg-rose-50';
            case 'warning':
                return 'bg-amber-50/70 border-amber-100/80 shadow-amber-500/5 hover:bg-amber-50';
            default:
                return 'bg-blue-50/70 border-blue-100/80 shadow-blue-500/5 hover:bg-blue-50';
        }
    };

    if (activeAlerts.length === 0) {
        return (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Operations Normal</h3>
                <p className="text-[11px] text-emerald-600/85 mt-1 font-bold">All nodes active · POS terminals synced · 100% gateway success rate</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Alerts & Recovery Console
                    </h2>
                </div>
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {activeAlerts.length} Active System Issues
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={cn(
                            "p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-sm hover:shadow-md",
                            getSeverityStyles(alert.severity, alert.status)
                        )}
                    >
                        {/* Status bar */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            alert.status === 'acknowledged'
                                ? "bg-slate-300"
                                : alert.severity === 'critical'
                                ? "bg-rose-500"
                                : "bg-amber-500"
                        )} />

                        <div className="flex items-start gap-4.5">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                {getAlertIcon(alert.type)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                                        {alert.storeName || 'All Stores'}
                                    </span>
                                    <span className="text-[9px] font-semibold text-slate-400 block">
                                        {alert.timestamp}
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-800 leading-snug">
                                    {alert.message}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Recovery Buttons */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-200/40 pt-3">
                            {alert.status !== 'acknowledged' && (
                                <button
                                    onClick={() => onAcknowledge(alert.id)}
                                    className="px-2.5 py-1.5 text-[9px] font-black text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all"
                                >
                                    Acknowledge
                                </button>
                            )}
                            <button
                                onClick={() => onResolve(alert.id)}
                                className="px-2.5 py-1.5 text-[9px] font-black text-emerald-600 hover:text-white hover:bg-emerald-600 bg-white border border-emerald-200 hover:border-emerald-600 rounded-lg uppercase tracking-wider active:scale-95 transition-all"
                            >
                                Resolve
                            </button>
                            {(alert.type === 'sync_fail' || alert.type === 'pos_disconnect' || alert.type === 'menu_publish_fail') && (
                                <button
                                    onClick={() => onRetry(alert.id)}
                                    className="px-2.5 py-1.5 text-[9px] font-black text-white bg-slate-900 hover:bg-slate-800 rounded-lg uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                                >
                                    <RefreshCcw className="w-2.5 h-2.5 animate-in spin-in-12 duration-1000" />
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
