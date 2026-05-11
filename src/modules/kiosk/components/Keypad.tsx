'use client';

import React from 'react';

interface KeypadProps {
    onPress: (val: string) => void;
    onDelete: () => void;
    onClear: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onPress, onDelete, onClear }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'];

    return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => {
                        if (key === 'Clear') onClear();
                        else if (key === '⌫') onDelete();
                        else onPress(key);
                    }}
                    className={`
                        h-24 text-3xl font-bold rounded-2xl flex items-center justify-center
                        transition-all duration-100 active:scale-95 shadow-md
                        ${key === 'Clear' || key === '⌫'
                            ? 'bg-zinc-100 text-zinc-600 active:bg-zinc-200'
                            : 'bg-white text-zinc-900 active:bg-brand active:text-white border-2 border-zinc-50'
                        }
                    `}
                >
                    {key}
                </button>
            ))}
        </div>
    );
};
