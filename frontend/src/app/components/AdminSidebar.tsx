import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, ClipboardList, UserCircle, LogOut,
  PlusCircle, Upload, Menu, X, Users
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  role?: 'admin' | 'vet';
}

export function AdminSidebar({ role = 'admin' }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/case-management', icon: FolderOpen, label: 'Cases' },
    { to: '/admin/vet-applications', icon: ClipboardList, label: 'Applications' },
    { to: '/admin/user-management', icon: Users, label: 'Users' },
    { to: '/admin/recovery-approvals', icon: Upload, label: 'Recoveries' },
  ];

  const vetLinks = [
    { to: '/vet/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vet/create-case', icon: PlusCircle, label: 'New Case' },
    { to: '/vet/recovery-upload', icon: Upload, label: 'Recovery Update' },
    { to: '/browse', icon: FolderOpen, label: 'Community Feed' },
  ];

  const links = role === 'admin' ? adminLinks : vetLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 min-h-screen sticky top-0 h-screen ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/60">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="CuraVet Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-black text-emerald-400">CuraVet</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              isActive(to)
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer Links */}
      <div className="p-2 border-t border-gray-700/60 space-y-1">
        <Link
          to={role === 'admin' ? '/admin/dashboard' : '/vet/profile'}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
            isActive('/profile') || isActive('/vet/profile')
              ? 'bg-emerald-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <UserCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
