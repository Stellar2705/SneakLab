import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { useProducts, clearProductCache } from '../data/useProducts.js';
import { rupees, discount } from '../utils/format.js';

const STATUS = ['Placed', 'Shipped', 'Delivered', 'Refunded'];

const EMPTY_FORM = {
  name: '',
  price: '',
  mrp: '',
  images: '',
  category: 'Sneakers',
  stock: '',
  description: '',
  colors: '',
  sizes: '',
  isBestseller: false,
};

export default function Admin() {
  const { user, isAdmin, login } = useAuth();
  const { products } = useProducts();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: '' });
  const [coupons, setCoupons] = useState([]);

  const loadTab = useCallback(
    async (t) => {
      setErr('');
      try {
        if (t === 'overview') {
          const d = await api('/api/admin/stats');
          setStats(d.stats);
        } else if (t === 'orders') {
          const d = await api('/api/admin/orders');
          setOrders(d.orders);
        } else if (t === 'coupons') {
          const d = await api('/api/admin/coupons');
          setCoupons(d.coupons);
        }
      } catch (ex) {
        setErr(ex.message);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!isAdmin) return;
    loadTab('overview');
  }, [isAdmin, loadTab]);

  const tabs = [
    ['overview', 'Overview'],
    ['products', 'Products'],
    ['orders', 'Orders'],
    ['coupons', 'Coupons'],
  ];

  const lowStock = useMemo(() => products.filter((p) => p.stock <= 12), [products]);

  /* -------- Gate: admin auth (after ALL hooks — Rules of Hooks) -------- */
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">SNEAKLAB Panel</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tightest">Admin login</h1>
        <p className="mt-3 text-sm text-neutral-500">
          Sign in with an admin account. Demo creds: <code className="font-mono">admin@sneaklab.com / Admin@123</code>
        </p>
        {user && (
          <p className="mt-3 text-xs font-semibold text-rust">
            You're signed in as {user.name || user.email} (not admin). Re-login as admin below.
          </p>
        )}
        <button
          onClick={async () => {
            try {
              setErr('');
              await login('admin@sneaklab.com', 'Admin@123');
            } catch (ex) {
              setErr(ex.message);
            }
          }}
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust"
        >
          {user ? 'Re-login as admin' : 'Login as demo admin'}
        </button>
        {err && <p className="mt-4 text-sm font-semibold text-rust">{err}</p>}
      </div>
    );
  }

  /* -------- Actions -------- */
  const setStatus = async (id, status) => {
    try {
      await api(`/api/admin/orders/${id}/status`, { method: 'PUT', body: { status } });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const refund = async (id) => {
    try {
      const d = await api(`/api/admin/orders/${id}/refund`, { method: 'PUT' });
      setOrders((prev) => prev.map((o) => (o._id === id ? d.order : o)));
      clearProductCache(); // stock changed
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const removeProduct = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      clearProductCache();
      window.location.reload(); // simplest way to refresh the cached catalog
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api('/api/admin/products', { method: 'POST', body: form });
      setShowForm(false);
      setForm(EMPTY_FORM);
      clearProductCache();
      window.location.reload();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const addCoupon = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api('/api/admin/coupons', { method: 'POST', body: couponForm });
      setCouponForm({ code: '', type: 'percent', value: '' });
      loadTab('coupons');
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">
            SNEAKLAB Panel · {user?.email}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tightest">Admin</h1>
        </div>
        <div className="flex flex-wrap gap-2 rounded-full border border-ink/10 bg-white p-1">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setTab(k);
                loadTab(k);
              }}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition ${
                tab === k ? 'bg-ink text-bone' : 'text-neutral-500 hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="mb-4 rounded-xl bg-rust/10 px-4 py-3 text-sm font-semibold text-rust">{err}</p>}

      {/* -------- Overview -------- */}
      {tab === 'overview' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Revenue', stats ? rupees(stats.revenue) : '—'],
              ['Orders', stats ? String(stats.orders) : '—'],
              ['Pending', stats ? String(stats.pending) : '—'],
              ['Low stock', stats ? String(stats.lowStock) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">{label}</p>
                <p className="mt-2 font-display text-3xl font-semibold tracking-tightest">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-ink p-6 text-bone">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-bone/40">Catalog</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {stats ? `${stats.products} products` : 'Loading…'}
              </p>
              <p className="mt-1 text-sm text-bone/60">
                Bestsellers {products.filter((p) => p.isBestseller).length} · Live on MongoDB
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">Low stock alerts</p>
              <ul className="mt-3 space-y-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p._id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="font-bold text-rust">{p.stock} left</span>
                  </li>
                ))}
                {lowStock.length === 0 && <li className="text-neutral-400">All healthy.</li>}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* -------- Products -------- */}
      {tab === 'products' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-bone transition hover:bg-rust"
            >
              {showForm ? 'Close form' : '+ Add product'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addProduct} className="mb-6 grid gap-3 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
              <input required placeholder="Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink">
                <option>Sneakers</option>
                <option>Streetwear</option>
              </select>
              <input required type="number" placeholder="Price ₹" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input type="number" placeholder="MRP ₹ (optional)" value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required type="number" placeholder="Stock" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required placeholder="Image URLs (comma separated)" value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input placeholder="Colors (comma separated)" value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input placeholder="Sizes (comma separated e.g. 8,9,10 or S,M,L)" value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <textarea placeholder="Description" rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink sm:col-span-2" />
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.isBestseller}
                  onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} />
                Bestseller
              </label>
              <button className="rounded-full bg-ink py-3 text-sm font-bold uppercase tracking-widest text-bone hover:bg-rust sm:col-span-2">
                Save product
              </button>
            </form>
          )}

          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-neutral-400">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{rupees(p.price)}</td>
                    <td className={`px-5 py-4 font-semibold ${p.stock <= 12 ? 'text-rust' : ''}`}>{p.stock}</td>
                    <td className="px-5 py-4">{discount(p)}%</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/product/${p._id}`}
                        className="mr-3 text-xs font-bold uppercase tracking-widest text-neutral-400 underline hover:text-ink"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => removeProduct(p._id)}
                        className="text-xs font-bold uppercase tracking-widest text-neutral-400 underline hover:text-rust"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-400">
                      No products — run <code className="font-mono">npm run seed</code> in backend.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* -------- Orders -------- */}
      {tab === 'orders' && (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-neutral-400">
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Refund</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className={`border-b border-ink/5 last:border-0 ${o.status === 'Refunded' ? 'bg-rust/5' : ''}`}>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold">{o.orderNumber}</p>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{o.address?.name || o.user?.name}</p>
                    <p className="text-xs text-neutral-400">{o.address?.city}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-neutral-500">
                    {o.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                  </td>
                  <td className="px-5 py-4 font-semibold">{rupees(o.total)}</td>
                  <td className="px-5 py-4 text-xs">
                    <span className="font-bold">{o.payment?.method}</span>{' '}
                    <span className={o.payment?.status === 'Paid' ? 'text-green-600' : 'text-neutral-400'}>
                      {o.payment?.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {o.status === 'Refunded' ? (
                      <span className="rounded-full bg-rust/10 px-3 py-1 text-xs font-bold text-rust">Refunded</span>
                    ) : (
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o._id, e.target.value)}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold outline-none focus:border-ink"
                      >
                        {STATUS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => refund(o._id)}
                      disabled={o.status === 'Refunded'}
                      className="text-xs font-bold uppercase tracking-widest text-neutral-400 underline hover:text-rust disabled:opacity-40"
                    >
                      {o.status === 'Refunded' ? '—' : 'Refund'}
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-neutral-400">
                    No orders yet — place one from the storefront.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* -------- Coupons -------- */}
      {tab === 'coupons' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-neutral-400">
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Value</th>
                  <th className="px-5 py-4">Active</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-4 font-mono font-bold">{c.code}</td>
                    <td className="px-5 py-4">{c.type === 'percent' ? 'Percentage' : 'Flat ₹'}</td>
                    <td className="px-5 py-4">{c.type === 'percent' ? `${c.value}%` : rupees(c.value)}</td>
                    <td className="px-5 py-4">
                      <span className={c.isActive ? 'text-green-600' : 'text-neutral-400'}>
                        {c.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-neutral-400">
                      No coupons yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={addCoupon} className="h-fit grid gap-3 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold">New coupon</h3>
            <input required placeholder="CODE" value={couponForm.code}
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
              className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
            <select value={couponForm.type}
              onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
              className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink">
              <option value="percent">Type · %</option>
              <option value="flat">Type · Flat ₹</option>
            </select>
            <input required type="number" min="1" placeholder="Value" value={couponForm.value}
              onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
              className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
            <button className="rounded-full bg-ink py-3 text-sm font-bold uppercase tracking-widest text-bone hover:bg-rust">
              Create coupon
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
