import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, BarChart3, LogOut, LayoutDashboard, 
  UserCircle, Plus, Check, X, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, AuthUser, Employee, LeaveRequest, LeaveStatus } from './types';

// --- API Service Layer ---
const API_URL = '/api';

const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

// --- Components ---

const LoginPage = ({ onLogin }: { onLogin: (token: string, user: AuthUser) => void }) => {
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.fetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.token, data.user);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-[24px] font-black text-white tracking-tighter uppercase italic">ENTRPRS.IO</h2>
          <p className="text-[11px] text-white/50 uppercase tracking-[2px] font-bold mt-1">Unified Management Protocol</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[1px] mb-1.5 block">Access Identifier</label>
              <input
                type="email"
                required
                placeholder="admin@enterprise.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20 text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[1px] mb-1.5 block">Secure Passkey</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20 text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-white text-sm font-black rounded-lg shadow-lg shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Initializing...' : 'Authorize Access'}
          </button>
          
          <div className="pt-6 border-t border-white/5 text-[10px] text-center text-white/30 space-y-2 font-medium">
             <p className="uppercase tracking-widest opacity-50 mb-2">Simulation Credentials</p>
             <div className="grid grid-cols-2 gap-2 text-left bg-white/[0.02] p-3 rounded-lg">
                <div>
                   <p className="text-white/20 mb-1 font-black">ADMINISTRATOR</p>
                   <p>admin@enterprise.com</p>
                </div>
                <div>
                   <p className="text-white/20 mb-1 font-black">HUMAN RESOURCE</p>
                   <p>hr@enterprise.com</p>
                </div>
                <div>
                   <p className="text-white/20 mb-1 font-black">TEAM MANAGER</p>
                   <p>manager@enterprise.com</p>
                </div>
                <div>
                   <p className="text-white/20 mb-1 font-black">GENERAL STAFF</p>
                   <p>alice@enterprise.com</p>
                </div>
             </div>
             <p className="pt-2 uppercase tracking-tighter opacity-40">System Pass: <span className="text-white/60">password123</span></p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: AuthUser }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'employees' | 'leaves' | 'performance'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentView]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, leaveData] = await api.fetch('/employees').then(e => [e, []]).catch(() => [[], []]); 
      // Fallback if one fails
      const lData = await api.fetch('/leaves').catch(() => []);
      setEmployees(empData || []);
      setLeaves(lData || []);
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id: string, status: LeaveStatus) => {
    try {
      await api.fetch(`/leaves/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading enterprise system...</div>;

    switch (currentView) {
      case 'overview':
        return (
          <div className="grid grid-cols-12 gap-4 lg:h-[calc(100vh-160px)]">
            <div className="col-span-12 lg:col-span-8 lg:row-span-4 bento-card">
              <div className="card-title">
                <span>Active Employee Directory</span>
                <span onClick={() => setCurrentView('employees')} className="text-accent cursor-pointer">View All</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-muted font-medium">
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Department</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.slice(0, 5).map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-2">
                          <p className="font-bold">{emp.name}</p>
                          <p className="text-[11px] text-muted">{emp.email}</p>
                        </td>
                        <td className="py-3 px-2">{emp.departmentId}</td>
                        <td className="py-3 px-2">
                          <span className={`badge ${
                            emp.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-700' :
                            emp.role === UserRole.HR ? 'bg-pink-50 text-pink-700' :
                            emp.role === UserRole.MANAGER ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted font-mono">{emp.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-2 bento-card">
              <div className="card-title">System Environment</div>
               <div className="space-y-4">
                 <SystemStat label="PostgreSQL Instance" value="v14.5" status="success" />
                 <SystemStat label="Redis Cache" value="Healthy" status="success" />
                 <SystemStat label="Docker Clusters" value="3 Running" status="accent" />
                 <SystemStat label="JWT Auth Server" value="Secure" status="success" />
               </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-2 bento-card">
              <div className="card-title">Pending Leaves</div>
              <div className="space-y-3">
                {leaves.filter(l => l.status === LeaveStatus.PENDING).slice(0, 3).map(l => (
                  <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-[13px]">
                      <strong>{l.employeeId.split('-')[1]}</strong> <span className="text-muted text-[11px]">({l.type})</span>
                    </div>
                    <div className="text-accent text-[11px] font-bold cursor-pointer hover:underline" onClick={() => setCurrentView('leaves')}>REVIEW</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-12 lg:row-span-2 bento-card">
              <div className="card-title">Audit Trail & Global Logs</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 outline-none">
                <div className="space-y-2">
                  <AuditItem time="14:22:01" tag="@ADMIN" color="text-indigo-600" text="Updated role for System Admin" />
                  <AuditItem time="14:18:45" tag="@SERVICE" color="text-emerald-600" text="Redis cache invalidated: DEPT_MAP" />
                  <AuditItem time="14:15:30" tag="@HR_SRV" color="text-pink-600" text="Created new employee entity" />
                </div>
                <div className="space-y-2">
                  <AuditItem time="14:10:12" tag="@AUTH" color="text-indigo-600" text="JWT token issued to client IP" />
                  <AuditItem time="14:05:55" tag="@WARN" color="text-amber-600" text="Slow query detected on DB" />
                  <AuditItem time="13:58:22" tag="@SYSTEM" color="text-emerald-600" text="Auto-scaling: provisioned 1 node" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'employees':
        return (
          <div className="bento-card !p-0">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                 <input type="text" placeholder="Search entities..." className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-accent outline-none" />
               </div>
               {(user.role === UserRole.ADMIN || user.role === UserRole.HR) && (
                 <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                   <Plus className="w-4 h-4" /> Add Employee
                 </button>
               )}
            </div>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-slate-50/50 text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold">{emp.name}</p>
                        <p className="text-[11px] text-muted">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                         emp.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-700' :
                         emp.role === UserRole.HR ? 'bg-pink-50 text-pink-700' :
                         emp.role === UserRole.MANAGER ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">{emp.departmentId}</td>
                    <td className="px-6 py-4 text-muted">{emp.joiningDate}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-accent hover:underline font-bold text-xs uppercase tracking-wider">Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'leaves':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-primary">Operational Leave Log</h2>
              {user.role === UserRole.EMPLOYEE && (
                <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:opacity-90">
                  Submit Request
                </button>
              )}
            </div>
            <div className="bento-card !p-0">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-slate-50/50 text-muted text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaves.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{l.employeeId}</td>
                      <td className="px-6 py-4">{l.type}</td>
                      <td className="px-6 py-4 text-muted">{l.startDate} » {l.endDate}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          l.status === LeaveStatus.APPROVED ? 'bg-emerald-50 text-emerald-700' : 
                          l.status === LeaveStatus.REJECTED ? 'bg-pink-50 text-pink-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {l.status === LeaveStatus.PENDING && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) ? (
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleLeaveAction(l.id, LeaveStatus.APPROVED)} className="p-1 px-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded text-xs font-bold uppercase">Approve</button>
                             <button onClick={() => handleLeaveAction(l.id, LeaveStatus.REJECTED)} className="p-1 px-2 border border-pink-200 text-pink-700 hover:bg-pink-50 rounded text-xs font-bold uppercase">Reject</button>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-slate-300">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div className="text-center py-20 text-muted font-medium">Module coming soon...</div>;
    }
  };

  return (
    <div className="h-screen bg-bg-main flex overflow-hidden">
      {/* Sidebar - Bento Dark Theme */}
      <div className="w-[240px] bg-primary text-white hidden lg:flex flex-col p-6 gap-8 overflow-y-auto">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tighter mb-1 uppercase">ENTRPRS.IO</h2>
          <p className="text-[11px] opacity-50 uppercase tracking-[1px] font-medium">Core Admin v2.4</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <NavItem active={currentView === 'overview'} icon={<LayoutDashboard size={18} />} label="Operational Dashboard" onClick={() => setCurrentView('overview')} />
          <NavItem active={currentView === 'employees'} icon={<Users size={18} />} label="Employee Directory" onClick={() => setCurrentView('employees')} />
          <NavItem active={currentView === 'leaves'} icon={<Calendar size={18} />} label="Leave Requests" onClick={() => setCurrentView('leaves')} />
          <NavItem active={currentView === 'performance'} icon={<BarChart3 size={18} />} label="Staff Reviews" onClick={() => setCurrentView('performance')} />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/5">
            <p className="text-[12px] font-bold mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              PostgreSQL Live
            </p>
            <p className="text-[10px] opacity-60 font-mono tracking-tighter">Lat: 0.42ms | Load: 12%</p>
          </div>
          
          <div className="flex items-center gap-3 py-2">
             <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-black">
               {user.name[0]}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[12px] font-bold truncate">{user.name}</p>
               <p className="text-[10px] opacity-40 uppercase font-black tracking-widest truncate">{user.role}</p>
             </div>
             <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-white/40 hover:text-pink-500 transition-colors"
             >
                <LogOut size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
           <div className="flex items-center gap-6">
             <h2 className="text-[18px] font-bold text-primary tracking-tight">{currentView === 'overview' ? 'Operational Dashboard' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}</h2>
             <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-lg">
                <Search size={14} className="text-muted mr-3" />
                <input type="text" placeholder="Search entities..." className="bg-transparent border-none text-sm outline-none w-48 text-primary placeholder:text-muted" />
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-bold text-primary">System Runtime</p>
                <p className="text-[11px] text-muted font-medium">Build 2.4.92-stable</p>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-bg-main relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
      active 
        ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/10' 
        : 'text-white/50 hover:bg-white/5 hover:text-white font-medium'
    }`}
  >
    <span className={active ? 'text-accent' : ''}>{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const SystemStat = ({ label, value, status }: { label: string, value: string, status: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${
      status === 'success' ? 'bg-success' : status === 'accent' ? 'bg-accent' : 'bg-warning'
    }`}></div>
    <div className="flex-1 text-[14px] font-medium text-primary">{label}</div>
    <div className="text-[12px] text-muted font-mono">{value}</div>
  </div>
);

const AuditItem = ({ time, tag, color, text }: { time: string, tag: string, color: string, text: string }) => (
  <div className="flex gap-4 py-2 border-b border-slate-50 last:border-none text-[12px]">
    <span className="text-muted w-16 shrink-0 font-mono">{time}</span>
    <span className={`${color} font-black w-20 shrink-0`}>{tag}</span>
    <span className="text-primary/80 line-clamp-1">{text}</span>
  </div>
);

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setInit(true);
  }, []);

  const handleLogin = (token: string, user: AuthUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  if (!init) return null;

  return user ? <Dashboard user={user} /> : <LoginPage onLogin={handleLogin} />;
}
