import { Wrench, CheckCircle, AlertTriangle, Plus } from 'lucide-react';

async function getEquipment() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/admin";
    const res = await fetch(`${API_URL}/equipment`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch equipment');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function EquipmentPage() {
  const equipmentList = await getEquipment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Equipment Registry</h1>
           <p className="text-gray-400 mt-1">Track asset status and maintenance schedules.</p>
        </div>
        <button className="bg-[var(--primary)] hover:bg-[#bbe300] text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Add Equipment
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#333] flex items-center gap-4">
            <div className="p-3 bg-green-950/30 rounded-lg text-green-400">
                <CheckCircle size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">42</h3>
                <p className="text-sm text-gray-400">Operational</p>
            </div>
         </div>
         <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#333] flex items-center gap-4">
            <div className="p-3 bg-yellow-950/30 rounded-lg text-yellow-500">
                <Wrench size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">3</h3>
                <p className="text-sm text-gray-400">Maintenance Due</p>
            </div>
         </div>
         <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#333] flex items-center gap-4">
            <div className="p-3 bg-red-950/30 rounded-lg text-red-500">
                <AlertTriangle size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">1</h3>
                <p className="text-sm text-gray-400">Out of Order</p>
            </div>
         </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-[#1E1E1E] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-[#252525] text-gray-400 text-sm uppercase">
                <tr>
                    <th className="px-6 py-4 font-semibold">Equipment Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Last Service</th>
                    <th className="px-6 py-4 font-semibold">Next Due</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
                {equipmentList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#252525] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 text-gray-400">{item.category}</td>
                        <td className="px-6 py-4">
                             <span className={`text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                                item.status === 'Operational' ? 'bg-green-950/30 text-green-400' : 
                                item.status === 'Maintenance' ? 'bg-yellow-950/30 text-yellow-500' :
                                'bg-red-950/30 text-red-400'
                            }`}>
                                {item.status === 'Maintenance' && <Wrench size={10} />}
                                {item.status === 'Broken' && <AlertTriangle size={10} />}
                                {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{item.lastService}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{item.nextService}</td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-gray-400 hover:text-[var(--primary)] text-sm font-medium">
                                Details
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

