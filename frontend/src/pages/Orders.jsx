import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { rupees } from '../utils/format.js';

const badgeCls = (status) => {
  const cls = {
    Placed: 'bg-amber-500/10 text-amber-600',
    Shipped: 'bg-blue-500/10 text-blue-600',
    Delivered: 'bg-green-500/10 text-green-600',
    Refunded: 'bg-rust/10 text-rust',
  }[status] || 'bg-ink/5 text-neutral-500';
  return `rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${cls}`;
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) return setLoading(false);
    api('/api/orders/mine')
      .then((d) => setOrders(d.orders))
      .catch((ex) => setErr(ex.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <p className="mx-auto max-w-7xl px-5 py-24 text-center text-sm text-neutral-400 lg:px-8">Loading orders…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tightest">Login required</h1>
        <p className="mt-3 text-sm text-neutral-500">Track your orders after signing in.</p>
        <Link to="/login" className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust">
          Login
        </Link>
      </div>
    );
  }

  if (err) {
    return <p className="mx-auto max-w-7xl px-5 py-24 text-center text-sm font-semibold text-rust lg:px-8">{err}</p>;
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tightest">No orders yet</h1>
        <p className="mt-3 text-sm text-neutral-500">The drop is live — go pick something.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">Delivery tracking</p>
      <h1 className="mt-2 mb-10 font-display text-4xl font-semibold tracking-tightest">My orders</h1>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold">{o.orderNumber}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={badgeCls(o.status)}>{o.status}</span>
                <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  {o.payment?.method} · {o.payment?.status}
                </span>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 border-t border-ink/5 pt-4 text-sm">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-neutral-600">
                    {it.name} <span className="text-neutral-400">× {it.qty}</span>
                  </span>
                  <span className="font-semibold">{rupees(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/5 pt-4">
              <p className="text-xs text-neutral-400">
                📍 {o.address?.name}, {o.address?.city} — {o.address?.pincode}
              </p>
              <p className="text-lg font-bold">{rupees(o.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
