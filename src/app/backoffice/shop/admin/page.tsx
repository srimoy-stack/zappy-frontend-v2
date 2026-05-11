'use client';

import { useEffect, useState } from 'react';
import { shopService } from '@/modules/shop/services/shopService';
import { ShopItem, Order } from '@/modules/shop/types';
import { formatCurrency } from '@/utils';
import { useToast } from '@/modules/shop/context/ToastContext';
import {
    LayoutGrid,
    ListOrdered,
    Download,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    Calendar,
    Tag,
    Plus,
    X,
    TrendingUp,
    Package,
    ArrowUpRight
} from 'lucide-react';

export default function ShopAdminPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'items' | 'orders'>('items');
    const [items, setItems] = useState<ShopItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'packaging',
        price: '',
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        const [itemsData, ordersData] = await Promise.all([
            shopService.getAllItems(),
            shopService.getOrders()
        ]);
        setItems(itemsData);
        setOrders(ordersData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleToggleStatus = async (id: string) => {
        await shopService.toggleItemStatus(id);
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, active: !item.active } : item
        ));
        showToast('Product status updated', 'success');
    };

    const handleExport = async () => {
        showToast('Preparing report...', 'info');
        const csv = await shopService.exportOrdersCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `orders_${new Date().toISOString()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Report downloaded successfully', 'success');
    };

    const handleSaveProduct = () => {
        if (!newProduct.name || !newProduct.price) {
            return showToast('Please fill all required fields', 'error');
        }

        const item: ShopItem = {
            id: `PROD-${Math.floor(Math.random() * 9000) + 1000}`,
            name: newProduct.name,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            description: newProduct.description,
            shortDescription: newProduct.description.substring(0, 60) + '...',
            includes: ['Standard Production', 'Quality Check'],
            billingType: 'ONE_TIME',
            stockStatus: 'In Stock',
            image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1974&auto=format&fit=crop',
            active: true
        };

        setItems(prev => [item, ...prev]);
        showToast('Product launched successfully!', 'success');
        setShowAddModal(false);
        setNewProduct({ name: '', category: 'packaging', price: '', description: '' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Control Panel</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* Admin Header & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
                        Enterprise Control
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                        Shop Systems
                    </h1>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group hover:border-emerald-500 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                        <TrendingUp className="text-emerald-500" size={24} />
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">+12.4%</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(orders.reduce((acc, o) => acc + o.amount, 0))}</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                    <div className="flex items-center justify-between">
                        <Package className="text-white/40" size={24} />
                        <ArrowUpRight className="text-white/40" size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Active Catalog</p>
                        <p className="text-3xl font-black text-white tracking-tight">{items.length} Products</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-slate-100 p-2 rounded-3xl border border-slate-200 inline-flex">
                <button
                    onClick={() => setActiveTab('items')}
                    className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'items'
                        ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <LayoutGrid size={16} />
                    Product Catalog
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'orders'
                        ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <ListOrdered size={16} />
                    Order Management
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30">
                {activeTab === 'items' ? (
                    <div className="divide-y divide-slate-100">
                        <div className="px-10 py-8 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Catalog Management</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility and pricing controls</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-100"
                            >
                                <Plus size={16} />
                                Launch Product
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</th>
                                        <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl border border-slate-100 overflow-hidden bg-white shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-tight mb-1">{item.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <p className="text-sm font-black text-slate-900">{formatCurrency(item.price)}</p>
                                                <p className="text-[9px] font-bold text-slate-401 uppercase opacity-60">{item.billingType.replace('_', ' ')}</p>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {item.active ? 'Active' : 'Offline'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`p-4 rounded-2xl transition-all shadow-sm ${item.active
                                                        ? 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                        }`}
                                                >
                                                    {item.active ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <div className="px-10 py-8 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order Activity</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregated transaction history</p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                            >
                                <Download size={16} />
                                Export Intel
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Details</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">End User</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</th>
                                        <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution</th>
                                        <th className="text-right px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                                                        <Tag size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-tight mb-1">{order.itemName}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{order.orderId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <div className="flex items-center gap-3 group">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black">
                                                        {(order.customerEmail?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{order.customerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-sm font-black text-slate-900">
                                                {formatCurrency(order.amount)}
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={12} />
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3 text-slate-400">
                                                    <Calendar size={14} />
                                                    <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal (Slide-over / Modal) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div className="bg-white rounded-[4rem] w-full max-w-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-500 relative z-10">
                        <div className="p-12 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">New Product</h3>
                                    <p className="text-sm text-slate-500 font-medium">Configure basic parameters for the marketplace listing.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commercial Name</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Eco-Starter Package V2"
                                        className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                                        <select
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 appearance-none cursor-pointer"
                                        >
                                            <option value="packaging">Packaging</option>
                                            <option value="print">Printing</option>
                                            <option value="modules">Software</option>
                                            <option value="marketing">Marketing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price ($)</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="0.00"
                                            className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <textarea
                                        rows={4}
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Summarize product value propositions..."
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 h-18 bg-slate-100 text-slate-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="flex-1 h-18 bg-emerald-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 active:scale-95"
                                >
                                    Confirm Launch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
