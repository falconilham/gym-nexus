import Link from 'next/link';
import { ArrowUpRight, Users, CreditCard, Activity } from 'lucide-react';

async function getStats() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/admin/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  } catch (error) {
    console.error(error);
    return { totalMembers: 0, dailyCheckIns: 0, revenue: 0, activeMembers: 0 };
  }
}

const KPICard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-[#1E1E1E] border border-[#333] p-6 rounded-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${title === 'Revenue' ? 'bg-green-950/30' : 'bg-[#2C2C2C]'}`}>
        <Icon size={24} className={title === 'Revenue' ? 'text-green-400' : 'text-[var(--primary)]'} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-green-400 bg-green-950/30 px-2 py-1 rounded">
          +{trend}% <ArrowUpRight size={12} className="ml-1"/>
        </span>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <h2 className="text-3xl font-bold text-white">{value}</h2>
      <span className="text-sm text-gray-500">{sub}</span>
    </div>
  </div>
);

const MOCK_CHECKINS = [
  { id: 1, name: 'Alice Smith', plan: 'Premium',  time: '10:42 AM', status: 'Active' },
  { id: 2, name: 'Bob Jones',   plan: 'Standard', time: '10:35 AM', status: 'Expired' },
  { id: 3, name: 'Charlie Day', plan: 'Premium',  time: '10:15 AM', status: 'Active' },
  { id: 4, name: 'Diana Prince',plan: 'Pro',      time: '09:55 AM', status: 'Active' },
];

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white">Dashboard</h1>
           <p className="text-gray-400 mt-1">Welcome back, Admin</p>
        </div>
        <button className="bg-[var(--primary)] hover:bg-[#bbe300] text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors">
            <Activity size={20} />
            Live Monitor
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
            title="Total Members" 
            value={stats.totalMembers.toLocaleString()} 
            sub="Active" 
            icon={Users} 
            trend={12} 
        />
        <KPICard 
            title="Daily Check-ins" 
            value={stats.dailyCheckIns} 
            sub="Today" 
            icon={Activity} 
             
        />
        <KPICard 
            title="Revenue" 
            value={`$${stats.revenue}`} 
            sub="This Month" 
            icon={CreditCard} 
            trend={8.4} 
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Feed */}
        <div className="bg-[#1E1E1E] border border-[#333] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#333] flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Recent Check-ins</h3>
                <button className="text-sm text-[var(--primary)] hover:underline">View All</button>
            </div>
            <div className="divide-y divide-[#333]">
                {MOCK_CHECKINS.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-[#252525] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{user.name}</h4>
                                <p className="text-xs text-gray-500">{user.plan} • {user.time}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                            user.status === 'Active' ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'
                        }`}>
                            {user.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Quick Actions / Scanner Placeholder */}
        <div className="bg-[#1E1E1E] border border-[#333] rounded-xl p-6 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-[#252525] rounded-full flex items-center justify-center mb-4 text-[var(--primary)]">
                <Activity size={40} />
             </div>
             <h3 className="text-xl font-bold text-white">Scanner Standby</h3>
             <p className="text-gray-400 mt-2 max-w-xs">
                To start the QR Check-in kiosk mode, switch to the "Scanner" view.
             </p>
             <Link 
                href="/scanner"
                className="mt-6 w-full py-3 border border-[#333] rounded-lg text-white hover:bg-[#252525] transition-colors inline-block"
             >
                Launch Kiosk Mode
             </Link>
        </div>
      </div>
    </div>
  );
}


