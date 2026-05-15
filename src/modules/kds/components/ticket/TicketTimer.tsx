'use client';

import React, { useState, useEffect } from 'react';
import { getSLAState, getRemainingSeconds } from '../../utils/slaUtils';
import { useKDSSound } from '../sound/useKDSSound';

interface TicketTimerProps {
    createdAt: string;
    prepTimeMinutes: number;
    stageStartedAt?: string;
}

export const TicketTimer: React.FC<TicketTimerProps> = ({ createdAt, prepTimeMinutes, stageStartedAt }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds(createdAt, prepTimeMinutes));
    const [slaState, setSlaState] = useState(getSLAState(createdAt, prepTimeMinutes));
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [stageTime, setStageTime] = useState(0); // in seconds
    const { playSound } = useKDSSound();
    const hasPlayedBreach = React.useRef(false);
    const hasPlayedWarning = React.useRef(false);

    useEffect(() => {
        const updateTimer = () => {
            const remaining = getRemainingSeconds(createdAt, prepTimeMinutes);
            const state = getSLAState(createdAt, prepTimeMinutes);

            const createdTime = new Date(createdAt).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - createdTime) / 60000);

            let sTime = 0;
            if (stageStartedAt) {
                sTime = Math.floor((now - new Date(stageStartedAt).getTime()) / 1000);
            }

            setRemainingSeconds(remaining);
            setSlaState(state);
            setElapsedMinutes(elapsed);
            setStageTime(sTime);

            if (state === 'OVERDUE' && !hasPlayedBreach.current) {
                playSound('SLA_BREACH');
                hasPlayedBreach.current = true;
            } else if (state === 'WARNING' && !hasPlayedWarning.current) {
                playSound('SLA_WARNING');
                hasPlayedWarning.current = true;
            } else if (state === 'ON_TIME') {
                hasPlayedBreach.current = false;
                hasPlayedWarning.current = false;
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [createdAt, prepTimeMinutes]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStateClasses = () => {
        switch (slaState) {
            case 'OVERDUE':
                return 'kds-timer-late bg-[var(--kds-status-late)] text-white p-2';
            case 'WARNING':
                return 'kds-timer-warning border-[var(--kds-status-warning)] text-[var(--kds-status-warning)] p-2';
            default:
                return 'border-[var(--kds-status-on-time)] text-[var(--kds-status-on-time)] p-2';
        }
    };

    return (
        <div className={`flex flex-col items-end gap-1 rounded-none border-2 ${getStateClasses()}`}>
            <div className="flex items-center gap-2">
                <span className="text-[12px] font-black uppercase tracking-widest opacity-60">REMAINING:</span>
                <span className="font-mono text-[var(--kds-font-timer)] font-black tabular-nums leading-none">
                    {formatTime(remainingSeconds)}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[12px] font-black uppercase tracking-widest opacity-60">ELAPSED:</span>
                <span className="text-xl font-black">{elapsedMinutes} MIN</span>
            </div>
            {stageStartedAt && (
                <div className="flex items-center gap-2 border-t border-white/20 pt-1 w-full justify-end">
                    <span className="text-[12px] font-black uppercase tracking-widest opacity-60">STAGE TIME:</span>
                    <span className="text-sm font-black text-amber-500 tabular-nums">
                        {formatTime(stageTime)}
                    </span>
                </div>
            )}
            <div className="text-[11px] font-black uppercase tracking-tighter">
                STATUS: {slaState.replace('_', ' ')}
            </div>
        </div>
    );
};
