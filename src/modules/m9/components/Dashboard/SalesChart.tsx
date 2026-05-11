import React from 'react';

export const SalesChart: React.FC = () => {
    // 15 data points to align with 8 labels (every 2nd point)
    // 8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm, 5pm, 6pm, 7pm, 8pm, 9pm, 10pm
    const data = [45, 52, 48, 70, 65, 80, 75, 90, 85, 95, 100, 110, 105, 120, 115];
    const labels = ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];

    const height = 280; // Increased height for better label visibility
    const width = 800; // SVG internal coordinate system width
    const padding = 40;

    const maxValue = Math.max(...data) * 1.1; // Add some headroom

    // Helper to get X coordinate for a given index
    const getX = (index: number) => {
        return (index / (data.length - 1)) * (width - padding * 2) + padding;
    };

    // Helper to get Y coordinate for a given value
    const getY = (value: number) => {
        return height - (value / maxValue) * (height - padding * 2) - padding;
    };

    // Function to create smooth Bezier curve path
    const getPath = (isArea = false) => {
        const points = data.map((d, i) => ({
            x: getX(i),
            y: getY(d)
        }));

        let d = `M ${points[0]!.x} ${points[0]!.y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i]!;
            const next = points[i + 1]!;
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            d += ` C ${cp1x} ${curr.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
        }

        if (isArea) {
            d += ` L ${points[points.length - 1]!.x} ${height - padding}`;
            d += ` L ${points[0]!.x} ${height - padding} Z`;
        }
        return d;
    };

    return (
        <div className="w-full h-[300px] flex flex-col pt-6">
            <div className="flex-1 relative">
                {/* overflow-visible allows tooltips/labels to extend if needed, preserveAspectRatio="none" allows resizing without fixed aspect ratio if container squishes */}
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
                        </linearGradient>
                        <filter id="shadow" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="4" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.1" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = height - padding - p * (height - padding * 2);
                        return (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    className="stroke-slate-100"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding - 15}
                                    y={y + 3}
                                    textAnchor="end"
                                    className="text-[10px] fill-slate-400 font-bold"
                                >
                                    {Math.round(p * maxValue / 10) * 10}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area under curve */}
                    <path d={getPath(true)} fill="url(#chartGradient)" />

                    {/* Smooth curve line */}
                    <path
                        d={getPath()}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#shadow)"
                    />

                    {/* Interactive points */}
                    {data.map((d, i) => {
                        // Only show points for the labelled timestamps (every 2nd item)
                        if (i % 2 !== 0) return null;
                        const x = getX(i);
                        const y = getY(d);
                        return (
                            <g key={i} className="group">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className="fill-white stroke-emerald-500 stroke-[3] transition-all duration-300 group-hover:r-6 cursor-pointer"
                                />
                                {/* Tooltip value */}
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <rect
                                        x={x - 20}
                                        y={y - 45}
                                        width="40"
                                        height="24"
                                        rx="6"
                                        className="fill-slate-900"
                                    />
                                    <text
                                        x={x}
                                        y={y - 29}
                                        textAnchor="middle"
                                        className="fill-white text-[10px] font-bold"
                                    >
                                        ${d}
                                    </text>
                                    {/* Arrow */}
                                    <path d={`M ${x - 4} ${y - 21} L ${x + 4} ${y - 21} L ${x} ${y - 17} Z`} className="fill-slate-900" />
                                </g>
                            </g>
                        );
                    })}

                    {/* X-axis labels */}
                    {labels.map((label, i) => {
                        // Data index corresponding to this label (0, 2, 4...)
                        const dataIndex = i * 2;
                        const x = getX(dataIndex);

                        return (
                            <text
                                key={i}
                                x={x}
                                y={height - padding + 20}
                                textAnchor="middle"
                                className="text-[10px] fill-slate-500 font-bold uppercase tracking-widest"
                            >
                                {label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};
