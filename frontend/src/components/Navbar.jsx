import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const linkCls = ({ isActive }) =>
  `text-sm font-semibold uppercase tracking-widest transition-colors ${
    isActive ? 'text-ink' : 'text-neutral-500 hover:text-ink'
  }`;

export default function Navbar() {
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-bone/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link to="/" className="font-display text-2xl font-bold tracking-tightest">
          SNEAK<span className="italic font-normal">LAB</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <NavLink to="/cart" className={linkCls}>
            Cart
          </NavLink>
          {user && (
            <NavLink to="/orders" className={linkCls}>
              Orders
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" className={linkCls}>
              Login
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkCls}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && !open && (
            <span className="hidden max-w-[140px] truncate text-sm font-bold md:block">
              {user.name || 'Account'}
            </span>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="hidden rounded-full border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-widest transition hover:bg-ink hover:text-bone md:block"
            >
              Logout
            </button>
          )}
          <button
            onClick={() => navigate('/cart')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-bone"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M2 2h3l2.4 12" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-bone">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-bone px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <button onClick={() => go('/')} className="text-left text-sm font-semibold uppercase tracking-widest">
              Home
            </button>
            <button onClick={() => go('/cart')} className="text-left text-sm font-semibold uppercase tracking-widest">
              Cart ({count})
            </button>
            {user && (
              <button onClick={() => go('/orders')} className="text-left text-sm font-semibold uppercase tracking-widest">
                Orders
              </button>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  go('/');
                }}
                className="text-left text-sm font-semibold uppercase tracking-widest"
              >
                Logout ({user.name || 'Account'})
              </button>
            ) : (
              <button onClick={() => go('/login')} className="text-left text-sm font-semibold uppercase tracking-widest">
                Login
              </button>
            )}
            {isAdmin && (
              <button onClick={() => go('/admin')} className="text-left text-sm font-semibold uppercase tracking-widest">
                Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
