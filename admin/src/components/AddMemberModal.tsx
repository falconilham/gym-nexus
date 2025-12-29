import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'Standard',
    duration: '1 Month'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/admin";
        const res = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            onSuccess();
            onClose();
            setFormData({ name: '', email: '', plan: 'Standard', duration: '1 Month' }); // Reset
        }
    } catch (error) {
        console.error('Error adding member:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-white">Add New Member</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
              className="w-full bg-[#0F0F0F] border border-[#333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              className="w-full bg-[#0F0F0F] border border-[#333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Plan</label>
                <select 
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    className="w-full bg-[#0F0F0F] border border-[#333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary)] appearance-none"
                >
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>Pro</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-[#0F0F0F] border border-[#333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary)] appearance-none"
                >
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>12 Months</option>
                </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-[#2C2C2C] text-white font-medium rounded-lg hover:bg-[#333] transition-colors"
             >
                Cancel
             </button>
             <button 
                type="submit"
                className="flex-1 py-3 px-4 bg-[var(--primary)] text-black font-bold rounded-lg hover:bg-[#bbe300] transition-colors"
             >
                Create Member
             </button>
          </div>
        </form>

      </div>
    </div>
  );
}

