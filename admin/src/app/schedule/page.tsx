import { ChevronLeft, ChevronRight, Plus, Users, Clock } from 'lucide-react';

async function getClasses() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/admin/classes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default async function SchedulePage() {
  const classList = await getClasses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Class Schedule</h1>
           <p className="text-gray-400 mt-1">Manage weekly timetables and trainer assignments.</p>
        </div>
        <button className="bg-[var(--primary)] hover:bg-[#bbe300] text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Add Class
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
         <button className="p-2 hover:bg-[#333] rounded-lg text-white">
            <ChevronLeft size={24} />
         </button>
         <div className="text-center">
            <h2 className="text-lg font-bold text-white">December 2025</h2>
            <p className="text-sm text-gray-400">Week 52</p>
         </div>
         <button className="p-2 hover:bg-[#333] rounded-lg text-white">
            <ChevronRight size={24} />
         </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-px bg-[#333] border border-[#333] rounded-xl overflow-hidden">
        {DAYS.map((day, index) => (
            <div key={day} className={`bg-[#1E1E1E] p-4 text-center ${index === 2 ? 'bg-[#252525]' : ''}`}>
                <span className={`text-sm font-bold ${index === 2 ? 'text-[var(--primary)]' : 'text-gray-400'}`}>{day}</span>
                <div className={`mt-2 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-bold ${index === 2 ? 'bg-[var(--primary)] text-black' : 'text-white'}`}>
                    {29 + index}
                </div>
            </div>
        ))}
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {classList.map((cls: any) => (
            <div key={cls.id} className="relative group pl-24 py-4 border-b border-[#333] last:border-0 hover:bg-[#1E1E1E]/50 rounded-lg transition-colors">
                {/* Time Indicator */}
                <div className="absolute left-4 top-5 text-gray-400 font-mono text-sm">
                    {cls.time}
                </div>
                
                {/* Class Card */}
                <div className="bg-[#252525] border border-[#333] p-4 rounded-xl ml-4 mr-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group-hover:border-[var(--primary)]/50 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className={`w-1 h-12 rounded-full ${cls.color}`}></div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{cls.title}</h3>
                            <p className="text-sm text-gray-400">with {cls.trainer} • {cls.duration}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-300 bg-[#1E1E1E] px-3 py-1.5 rounded-lg border border-[#333]">
                            <Users size={16} className="text-gray-500" />
                            <span className="text-sm font-medium">{cls.booked}/{cls.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${
                                cls.booked >= cls.capacity 
                                ? 'bg-red-950/30 text-red-500' 
                                : 'bg-green-950/30 text-green-500'
                             }`}>
                                {cls.booked >= cls.capacity ? 'FULL' : 'OPEN'}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
}

