import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { formatBDT } from '@skincare/shared';
import { Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminService.getCustomers(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Customer Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Manage registered buyers, lifetime value, and skin profiles.</p>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Skin Profile</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading customer profiles...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No customers registered yet.</td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-100">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="flex items-center gap-1 text-slate-400"><Mail size={12} /> {c.email}</p>
                      {c.phone && <p className="flex items-center gap-1 text-slate-500 font-mono mt-0.5"><Phone size={12} /> {c.phone}</p>}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 font-semibold text-emerald-400">
                        {c.preferredSkinType || 'Normal'} Skin
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{c.ordersCount} orders</td>
                    <td className="p-4 font-bold text-emerald-400">{formatBDT(c.totalSpent || 0)}</td>
                    <td className="p-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
