import React, { useState } from 'react';
import { 
    TrendingUp, 
    Calendar, 
    Clock, 
    ArrowUpRight, 
    BarChart3, 
    ShoppingBag, 
    Layers, 
    PieChart,
    ChevronRight
} from 'lucide-react';
import { SalesChannel, HeatmapPoint, TopProduct, ComboPerformance } from '../../types/dashboard';
import { formatCurrency, cn } from '@/utils';

interface AnalyticsSuiteProps {
    channels: SalesChannel[];
    heatmap: HeatmapPoint[];
    topProducts: TopProduct[];
    combos: ComboPerformance[];
    isLoading: boolean;
}

export const AnalyticsSuite: React.FC<AnalyticsSuiteProps> = ({
    channels,
    heatmap,
    topProducts,
    combos,
    isLoading
}) => {
    const [activeTab, setActiveTab] = useState<'trends' | 'heatmap' | 'products' | 'combos'>('trends');
    const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'aov'>('revenue');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Chart parameters
    const chartData = {
        revenue: [1800, 2400, 1950, 4800, 3900, 4100, 5800, 6200, 5200, 7100, 8900, 9200, 8100, 9900, 10800],
        orders: [50, 72, 58, 124, 110, 115, 160, 178, 142, 195, 240, 252, 218, 275, 310],
        aov: [36.00, 33.33, 33.62, 38.71, 35.45, 35.65, 36.25, 34.83, 36.62, 36.41, 37.08, 36.51, 37.16, 36.00, 34.84],
        labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM']
    };

    const height = 280;
    const width = 800;
    const paddingLeft = 75;
    const paddingRight = 45;
    const paddingTop = 45;
    const paddingBottom = 45;

    const dataPoints = chartData[chartMetric];
    const maxValue = Math.max(...dataPoints) * 1.1;

    const getX = (index: number) => {
        return (index / (dataPoints.length - 1)) * (width - paddingLeft - paddingRight) + paddingLeft;
    };

    const getY = (value: number) => {
        return height - (value / maxValue) * (height - paddingTop - paddingBottom) - paddingBottom;
    };

    const getPath = (isArea = false) => {
        const points = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d) }));
        let d = `M ${points[0]!.x} ${points[0]!.y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i]!;
            const next = points[i + 1]!;
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            d += ` C ${cp1x} ${curr.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
        }

        if (isArea) {
            d += ` L ${points[points.length - 1]!.x} ${height - paddingBottom}`;
            d += ` L ${points[0]!.x} ${height - paddingBottom} Z`;
        }
        return d;
    };

    const formatMetricValue = (val: number) => {
        if (chartMetric === 'revenue' || chartMetric === 'aov') {
            return formatCurrency(val);
        }
        return val.toString();
    };

    // Heatmap data helper
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];

    const getHeatIntensityColor = (intensity: number) => {
        if (intensity >= 8) return 'bg-emerald-600 hover:bg-emerald-500 text-white';
        if (intensity >= 5) return 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950';
        if (intensity >= 3) return 'bg-emerald-200 hover:bg-emerald-100 text-emerald-900';
        return 'bg-slate-100 hover:bg-slate-200 text-slate-400';
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header + Tabs */}
            <div className="px-6 pt-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 bg-slate-50/50">
                <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-500" /> Sales & Order Trends
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-tight">Hourly sales progress and busy store periods</p>
                </div>

                <div className="flex flex-wrap bg-slate-200/60 p-1 rounded-xl border border-slate-200/20">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'trends' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <TrendingUp className="w-3.5 h-3.5" /> Sales Trend
                    </button>
                    <button
                        onClick={() => setActiveTab('heatmap')}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'heatmap' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <Clock className="w-3.5 h-3.5" /> Busy Hours Map
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'products' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" /> Best Selling Items
                    </button>
                    <button
                        onClick={() => setActiveTab('combos')}
                        className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'combos' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" /> Combos & Upgrades
                    </button>
                </div>
            </div>

            <div className="p-6">
                {isLoading ? (
                    <div className="h-72 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* TAB 1: PERFORMANCE TREND CHART */}
                        {activeTab === 'trends' && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                        <button
                                            onClick={() => setChartMetric('revenue')}
                                            className={cn(
                                                "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                                chartMetric === 'revenue' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Revenue
                                        </button>
                                        <button
                                            onClick={() => setChartMetric('orders')}
                                            className={cn(
                                                "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                                chartMetric === 'orders' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Orders
                                        </button>
                                        <button
                                            onClick={() => setChartMetric('aov')}
                                            className={cn(
                                                "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                                                chartMetric === 'aov' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Average Ticket
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-slate-700 uppercase tracking-widest">Today's Live Trend</span>
                                    </div>
                                </div>

                                <div className="w-full h-[280px] relative select-none">
                                    {/* ── PREMIUM INTERACTIVE HOVER TOOLTIP DRAWER ── */}
                                    {hoveredIndex !== null && (
                                        <div 
                                            className="absolute z-30 bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl p-3.5 shadow-2xl pointer-events-none flex flex-col gap-1 transition-all duration-150 ease-out animate-in fade-in zoom-in-95 duration-150"
                                            style={{
                                                left: `${(getX(hoveredIndex) / width) * 100}%`,
                                                top: `${(getY(dataPoints[hoveredIndex]!) / height) * 100 - 15}%`,
                                                transform: 'translate(-50%, -100%)'
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                                    Time: {chartData.labels[hoveredIndex]}
                                                </span>
                                                {dataPoints[hoveredIndex] === Math.max(...dataPoints) && (
                                                    <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/30">
                                                        Peak Sales Hour
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-xs text-slate-400 font-bold">
                                                    {chartMetric === 'revenue' ? 'Sales:' : chartMetric === 'orders' ? 'Orders:' : 'Avg Ticket:'}
                                                </span>
                                                <span className="text-sm font-black text-emerald-400 tracking-tight">
                                                    {formatMetricValue(dataPoints[hoveredIndex]!)}
                                                </span>
                                            </div>
                                            <div className="border-t border-slate-800 pt-1 mt-1 flex flex-col gap-0.5 text-[9px] font-bold text-slate-400">
                                                {chartMetric === 'revenue' ? (
                                                    <div className="flex justify-between gap-4">
                                                        <span>Orders Count:</span>
                                                        <span className="text-white">{Math.round(dataPoints[hoveredIndex]! / 26.7)}</span>
                                                    </div>
                                                ) : chartMetric === 'orders' ? (
                                                    <div className="flex justify-between gap-4">
                                                        <span>Estimated Sales:</span>
                                                        <span className="text-white">{formatCurrency(dataPoints[hoveredIndex]! * 26.7)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between gap-4">
                                                        <span>Order Success:</span>
                                                        <span className="text-white">99.8%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <defs>
                                            {/* Glow shadow filter */}
                                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10B981" floodOpacity="0.25"/>
                                            </filter>

                                            {/* Premium multi-tone gradient stroke line */}
                                            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10B981" />
                                                <stop offset="50%" stopColor="#34D399" />
                                                <stop offset="100%" stopColor="#059669" />
                                            </linearGradient>

                                            {/* Translucent area fill gradient */}
                                            <linearGradient id="suiteChartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                                                <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                                            </linearGradient>
                                        </defs>

                                        {/* Y Axis Grid Lines - Ultra thin solid lines for premium modern look */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                                            const y = height - paddingBottom - p * (height - paddingTop - paddingBottom);
                                            return (
                                                <g key={i}>
                                                    <line
                                                        x1={paddingLeft}
                                                        y1={y}
                                                        x2={width - paddingRight}
                                                        y2={y}
                                                        className="stroke-slate-100/70"
                                                        strokeWidth="1"
                                                    />
                                                    <text
                                                        x={paddingLeft - 18}
                                                        y={y + 3}
                                                        textAnchor="end"
                                                        className="text-[9px] fill-slate-400 font-bold uppercase tracking-wider"
                                                    >
                                                        {formatMetricValue(Math.round(p * maxValue))}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Area under curve */}
                                        <path d={getPath(true)} fill="url(#suiteChartGradient)" />

                                        {/* ── HOVER SCAN LINE GUIDE ── */}
                                        {hoveredIndex !== null && (
                                            <line
                                                x1={getX(hoveredIndex)}
                                                y1={paddingTop}
                                                x2={getX(hoveredIndex)}
                                                y2={height - paddingBottom}
                                                className="stroke-emerald-500/20"
                                                strokeWidth="1.5"
                                                strokeDasharray="3 3"
                                            />
                                        )}

                                        {/* Smooth glow curve line with gradient */}
                                        <path
                                            d={getPath()}
                                            fill="none"
                                            stroke="url(#chartLineGradient)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#glow)"
                                        />

                                        {/* Radar-Pulsing glowing dots for hovered and peak states */}
                                        {dataPoints.map((d, i) => {
                                            const x = getX(i);
                                            const y = getY(d);
                                            const isMax = d === Math.max(...dataPoints);
                                            const isHovered = hoveredIndex === i;

                                            // Draw glowing beacons for high peaks or hover state
                                            if (isHovered) {
                                                return (
                                                    <g key={i}>
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="12"
                                                            className="fill-emerald-500/15 stroke-emerald-500/40 stroke-2 animate-ping"
                                                        />
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="6.5"
                                                            className="fill-white stroke-emerald-600 stroke-[3.5] shadow-md"
                                                        />
                                                    </g>
                                                );
                                            }

                                            if (isMax) {
                                                return (
                                                    <g key={i}>
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="8.5"
                                                            className="fill-amber-500/10 stroke-amber-500/30 stroke-2 animate-pulse"
                                                        />
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="4.5"
                                                            className="fill-white stroke-amber-500 stroke-[3]"
                                                        >
                                                            <title>Daily Peak</title>
                                                        </circle>
                                                    </g>
                                                );
                                            }

                                            // Subdued small dots for regular grid points to keep the chart extremely clean
                                            if (i % 2 === 0 || i === dataPoints.length - 1) {
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx={x}
                                                        cy={y}
                                                        r="3"
                                                        className="fill-white stroke-slate-300 stroke-2 hover:stroke-emerald-500 hover:r-4 transition-all duration-300 cursor-pointer"
                                                    />
                                                );
                                            }

                                            return null;
                                        })}

                                        {/* X-axis labels */}
                                        {chartData.labels.map((label, i) => {
                                            if (i % 2 !== 0) return null; // reduce density
                                            const x = getX(i);
                                            return (
                                                <text
                                                    key={i}
                                                    x={x}
                                                    y={height - paddingBottom + 20}
                                                    textAnchor="middle"
                                                    className="text-[9px] fill-slate-400 font-bold uppercase tracking-widest"
                                                >
                                                    {label}
                                                </text>
                                            );
                                        })}

                                        {/* ── HOVER SPLINE CONTROLLERS (Broad transparent rectangles) ── */}
                                        {dataPoints.map((d, i) => {
                                            const x = getX(i);
                                            const sliceWidth = (width - paddingLeft - paddingRight) / (dataPoints.length - 1);
                                            return (
                                                <rect
                                                    key={i}
                                                    x={x - sliceWidth / 2}
                                                    y={paddingTop}
                                                    width={sliceWidth}
                                                    height={height - paddingTop - paddingBottom}
                                                    fill="transparent"
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredIndex(i)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: HOURLY BUSINESS HEATMAP */}
                        {activeTab === 'heatmap' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Weekly Peak Heat Matrix</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Hourly order volumes mapped across weekdays</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 block" /> Quiet
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <span className="w-3 h-3 rounded bg-emerald-200 block" /> Moderate
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <span className="w-3 h-3 rounded bg-emerald-600 block" /> Peak Rush
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-[800px] space-y-2">
                                        {/* Hours label row */}
                                        <div className="grid grid-cols-14 items-center">
                                            <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">
                                                Day
                                            </div>
                                            {hours.map((hour) => (
                                                <div key={hour} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                    {hour}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day grids */}
                                        {days.map((day) => (
                                            <div key={day} className="grid grid-cols-14 items-center">
                                                <div className="col-span-1 text-[10px] font-black text-slate-700 uppercase tracking-wider text-right pr-4">
                                                    {day}
                                                </div>
                                                {hours.map((hour) => {
                                                    // Dynamic mock mapping or fetch from heatmap prop
                                                    const point = heatmap.find(h => h.day === day && h.hour === hour);
                                                    const intensity = point ? point.salesVolume : Math.floor(Math.random() * 10);
                                                    return (
                                                        <div
                                                            key={hour}
                                                            className={cn(
                                                                "h-9 m-0.5 rounded-lg border border-white flex items-center justify-center text-[10px] font-black transition-all cursor-pointer",
                                                                getHeatIntensityColor(intensity)
                                                            )}
                                                            title={`${day} ${hour} - Intensity Level: ${intensity}/10`}
                                                        >
                                                            {intensity > 7 && `${intensity * 12}`}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: TOP PRODUCTS */}
                        {activeTab === 'products' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                                        Top Best Selling Items (Volume & Revenue)
                                    </h4>
                                    <div className="divide-y divide-slate-50">
                                        {topProducts.map((product) => (
                                            <div key={product.name} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs shadow-inner">
                                                        {product.name[0]}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-slate-800">{product.name}</span>
                                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mt-0.5">
                                                            {product.salesCount} units sold today
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(product.revenue)}</span>
                                                    <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">Gross Share</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                                        Modifier Customization Intelligence
                                    </h4>
                                    <div className="space-y-4">
                                        {topProducts[0]?.modifierAttachment.map((modifier) => (
                                            <div key={modifier.name} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{modifier.name}</span>
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                                        {modifier.attachmentRate}% Attach Rate
                                                    </span>
                                                </div>
                                                {/* Bar gauge */}
                                                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${modifier.attachmentRate}%` }}
                                                    />
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                    Frequently attached to {topProducts[0]?.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: COMBO INTELLIGENCE */}
                        {activeTab === 'combos' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-indigo-50/30 p-4.5 rounded-2xl border border-indigo-100/50">
                                    <div className="flex items-center gap-2.5">
                                        <Layers className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Combo Meal Upgrades</p>
                                            <p className="text-[9px] text-indigo-700/80 font-bold uppercase tracking-tight">Attachment rate performance of upsells and menu recommendations</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {combos.map((combo) => (
                                        <div key={combo.comboName} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-xs font-black text-slate-800">{combo.comboName}</span>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{combo.ordersCount} combo upsells sold</p>
                                                </div>
                                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl tracking-tight">
                                                    {combo.attachmentRate}%
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${combo.attachmentRate}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span>Upsell conversion</span>
                                                    <span className="text-slate-900">{formatCurrency(combo.revenue)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
