import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { NAV_ITEMS } from './navConfig.js';
import { ROLE_LABELS } from '../utils/roles.js';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function SidebarContent({ items, roleLabel, onNavigate }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
        <Logo />
      </div>
      <div className="px-5 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {roleLabel}
      </div>
      <nav className="flex-1 space-y-1 px-3 pb-4" aria-label="Main navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const items = NAV_ITEMS[user.role] || [];
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent items={items} roleLabel={roleLabel} />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            <SidebarContent items={items} roleLabel={roleLabel} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {getInitials(user.name)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={() => setConfirmLogout(true)}
            >
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out of EduCare?"
        message="You will need to sign in again to access your tickets."
        confirmLabel="Log out"
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}