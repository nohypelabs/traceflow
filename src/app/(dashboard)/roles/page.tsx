'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Shield, ShieldCheck, ShieldAlert, Users, Loader2, Crown, Eye, UserCog } from 'lucide-react';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER'] as const;

const ROLE_CONFIG: Record<string, { label: string; level: number; color: string; icon: typeof Shield }> = {
  SUPER_ADMIN: { label: 'Super Admin', level: 100, color: 'text-yellow-400', icon: Crown },
  ADMIN: { label: 'Admin', level: 80, color: 'text-red-400', icon: ShieldAlert },
  MANAGER: { label: 'Manager', level: 60, color: 'text-blue-400', icon: ShieldCheck },
  USER: { label: 'User', level: 40, color: 'text-emerald-400', icon: UserCog },
  VIEWER: { label: 'Viewer', level: 0, color: 'text-zinc-400', icon: Eye },
};

export default function RolesPage() {
  const { data: users, isLoading, refetch } = api.role.listUsers.useQuery();
  const changeRole = api.role.changeRole.useMutation({
    onSuccess: () => refetch(),
  });

  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleChangeRole = (userId: string, newRole: string) => {
    changeRole.mutate({ userId, newRole: newRole as typeof ROLES[number] });
    setEditingUser(null);
  };

  return (
    <PageWrapper title="Kelola Role" subtitle="ROLE MANAGEMENT • SUPER ADMIN ONLY">
      <CyberCard>
        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-base font-semibold tracking-tight">Daftar Pengguna</div>
                <div className="text-[10px] text-zinc-500 -mt-0.5 tracking-[1px]">USER ROLES & PERMISSIONS</div>
              </div>
            </div>
            <div className="font-mono text-xs text-zinc-400 tabular-nums">
              {users?.length ?? 0} pengguna
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
          ) : !users?.length ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Belum ada pengguna
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/10">
                    <th className="pb-3 text-left text-[10px] font-medium tracking-[1.5px] text-zinc-500">PENGGUNA</th>
                    <th className="pb-3 text-left text-[10px] font-medium tracking-[1.5px] text-zinc-500">EMAIL</th>
                    <th className="pb-3 text-left text-[10px] font-medium tracking-[1.5px] text-zinc-500">ROLE</th>
                    <th className="pb-3 text-left text-[10px] font-medium tracking-[1.5px] text-zinc-500">LEVEL</th>
                    <th className="pb-3 text-right text-[10px] font-medium tracking-[1.5px] text-zinc-500">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const config = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.VIEWER;
                    const RoleIcon = config.icon;
                    const isEditing = editingUser === user.id;
                    const isChanging = changeRole.isPending && changeRole.variables?.userId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-cyan-400">
                                {(user.name ?? 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{user.name ?? 'Tanpa Nama'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{user.email}</td>
                        <td className="py-3.5">
                          {isEditing ? (
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              onBlur={() => setEditingUser(null)}
                              autoFocus
                              className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_CONFIG[r].label} ({ROLE_CONFIG[r].level})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <RoleIcon className={`h-3.5 w-3.5 ${config.color}`} />
                              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-xs text-zinc-400 tabular-nums">{config.level}</span>
                        </td>
                        <td className="py-3.5 text-right">
                          {isChanging ? (
                            <Loader2 className="h-4 w-4 text-cyan-400 animate-spin inline-block" />
                          ) : (
                            <button
                              onClick={() => setEditingUser(isEditing ? null : user.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                            >
                              {isEditing ? 'Batal' : 'Ubah Role'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
            <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-500 mb-3">ROLE HIERARCHY</div>
            <div className="flex flex-wrap gap-3">
              {ROLES.map((r) => {
                const config = ROLE_CONFIG[r];
                const Icon = config.icon;
                return (
                  <div key={r} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Icon className={`h-3 w-3 ${config.color}`} />
                    <span className="font-medium">{config.label}</span>
                    <span className="text-zinc-400">({config.level})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CyberCard>
    </PageWrapper>
  );
}
