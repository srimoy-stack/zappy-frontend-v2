'use client';

import React, { useState, useEffect } from 'react';
import { History, User as UserIcon, Shield } from 'lucide-react';
import { AuditLog } from '../../types/users';
import { userService } from '../../services/userService';

export const AuditLogPanel: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userService.getAuditLogs().then(data => {
            setLogs(data);
            setLoading(false);
        });
    }, []);

    if (loading) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <History size={18} className="text-slate-400" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">System Audit Log</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                        No activity recorded yet.
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex gap-3 items-start group">
                            <div className={`
                                mt-1 p-2 rounded-lg 
                                ${log.action === 'User User' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}
                            `}>
                                {log.action === 'User User' ? <UserIcon size={14} /> : <Shield size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {log.details}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400">{log.performedBy}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
