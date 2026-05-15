import { useRouter } from 'next/navigation';
;
import { ShieldCheck, Mail, Phone, UserCircle } from 'lucide-react';
import { UserProfile } from '../../types/settings';

interface ProfileSettingsProps {
    profile: UserProfile;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile }) => {
    const router = useRouter();
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-indigo-500">
                        <UserCircle size={18} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile</h3>
                </div>
            </div>

            <div className="p-8 flex-1">
                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-50">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{profile.name}</h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1">
                            <ShieldCheck size={10} /> {profile.role}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <Mail size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                            <span className="text-sm font-bold text-slate-700">{profile.email}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <Phone size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</span>
                            <span className="text-sm font-bold text-slate-700">{profile.phone}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <ShieldCheck size={16} />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security</span>
                                <span className="text-sm font-bold text-slate-700">Two-factor Authentication</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${profile.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                <button
                    onClick={() => router.push('/backoffice/more/profile/edit')}
                    className="w-full py-2 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-95"
                >
                    Edit Profile Details
                </button>
            </div>
        </div>
    );
};
