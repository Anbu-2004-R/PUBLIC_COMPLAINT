import React from 'react';
import { useAuth } from '../../app/AuthContext';
import { DEMO_USERS } from '../../mocks/mockData';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { ENV } from '../../config/env';

export function DemoBanner() {
  const { user, loginAsDemoUser } = useAuth();

  if (!ENV.IS_DEMO) return null;

  return (
    <aside
      aria-label="Demo environment status"
      className="bg-[#0B1220] text-slate-300 px-3 sm:px-6 py-1.5 text-xs font-medium border-b border-[#29384D] transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-teal-950/70 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            DEMO MODE
          </span>
          <span className="hidden md:inline text-slate-400 text-xs">
            In-memory store active · Simulated public grievance workflow
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Switch Role:</span>
          </span>
          <div className="flex items-center gap-1">
            {DEMO_USERS.map((demoU) => {
              const isCurrent = user?.id === demoU.id;
              const roleLabel =
                demoU.role === 'CITIZEN'
                  ? 'Citizen'
                  : demoU.role === 'OFFICER'
                  ? `Officer (${demoU.employeeId?.split('-')[1] || 'Dept'})`
                  : 'Admin';

              return (
                <button
                  key={demoU.id}
                  type="button"
                  onClick={() => loginAsDemoUser(demoU)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-500 text-[#0B1220] font-bold shadow-xs'
                      : 'bg-[#152238] text-slate-300 hover:text-white hover:bg-[#1E2E4A] border border-[#29384D]'
                  }`}
                  title={`${demoU.fullName} (${demoU.role})`}
                >
                  {demoU.fullName.split(' ')[0]} ({roleLabel})
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
