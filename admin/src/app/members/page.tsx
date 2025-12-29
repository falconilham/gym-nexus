"use client";

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, UserPlus, Filter } from 'lucide-react';
import AddMemberModal from '@/components/AddMemberModal';

interface Member {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  joinDate: string;
}

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/admin";
    fetch(`${API_URL}/members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error('Failed to fetch members', err));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Member Management</h1>
           <p className="text-gray-400 mt-1">Manage active memberships and user profiles.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--primary)] hover:bg-[#bbe300] text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
            <UserPlus size={20} />
            Add Member
        </button>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMembers}
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full bg-[#0F0F0F] border border-[#333] text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--primary)]"
            />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-white rounded-lg border border-[#333] hover:bg-[#333]">
            <Filter size={18} />
            Filter: All Plans
         </button>
      </div>

      {/* Table */}
      <div className="bg-[#1E1E1E] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-[#252525] text-gray-400 text-sm uppercase">
                <tr>
                    <th className="px-6 py-4 font-semibold">Member</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
                {members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#252525] transition-colors">
                        <td className="px-6 py-4">
                            <div>
                                <h4 className="text-white font-medium">{member.name}</h4>
                                <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                             <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                                member.status === 'Active' ? 'bg-green-950/30 text-green-400' : 
                                member.status === 'Expired' ? 'bg-red-950/30 text-red-400' :
                                'bg-yellow-950/30 text-yellow-500' // Suspended
                            }`}>
                                {member.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{member.plan}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{member.joinDate}</td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-gray-400 hover:text-white p-2">
                                <MoreHorizontal size={20} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Pagination Details (Static) */}
        <div className="px-6 py-4 border-t border-[#333] flex justify-between items-center text-sm text-gray-500">
            <span>Showing 1 to 5 of 1,240 entries</span>
            <div className="flex gap-2">
                 <button className="px-3 py-1 bg-[#2C2C2C] rounded hover:bg-[#333] text-white">Prev</button>
                 <button className="px-3 py-1 bg-[#2C2C2C] rounded hover:bg-[#333] text-white">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}

