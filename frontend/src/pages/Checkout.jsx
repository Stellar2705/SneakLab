import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { rupees } from '../utils/format.js';

/** Load Razorpay checkout.js once (only needed when backend has real keys). */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', city: '', pincode: '' });
  const [method, setMethod] = useState('COD');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null); // {itemsTotal, discount, shipping, total}
  const [couponErr, setCouponErr] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const preview = applied || { itemsTotal: subtotal, discount: 0, shipping: subtotal >= 3000 ? 0 : 149 };
  const total = preview.total ?? preview.itemsTotal - preview.discount + preview.shipping;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const applyCoupon = async () => {
    setCouponErr('');
    try {
      const d = await api('/api/coupons/validate', {
        method: 'POST',
        body: { code: coupon, itemsTotal: subtotal },
      });
      setApplied({ ...d, total: d.itemsTotal - d.discount + d.shipping });
    } catch (ex) {
      setApplied(null);
      setCouponErr(ex.message);
    }
  };

  /** Payment step: mock → server marks paid; real → Razorpay checkout + verify */
  const settlePayment = async (order, paymentMode) => {
    if (paymentMode === 'razorpay') {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Could not load Razorpay checkout');

      const { keyId, razorpayOrderId, amount } = await api('/api/payments/razorpay/create', {
        method: 'POST',
        body: { orderId: order._id },
      });

      await new Promise((resolve, reject) => {
        new window.Razorpay({
          key: keyId,
          amount: amount * 100,
          currency: 'INR',
          name: 'SNEAKLAB',
          description: order.orderNumber,
          order_id: razorpayOrderId,
          prefill: { name: form.name, contact: form.phone },
          theme: { color: '#0A0A0A' },
          handler: resolve,
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        }).open();
      }).then((rzpRes) =>
        api('/api/payments/razorpay/verify', {
          method: 'POST',
          body: {
            orderId: order._id,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: rzpRes.razorpay_payment_id,
            razorpay_signature: rzpRes.razorpay_signature,
          },
        })
      );
    } else if (paymentMode === 'mock') {
      await api(`/api/payments/mock/success/${order._id}`, { method: 'POST' });
    }
    // COD → nothing; order sits in "Placed / payment Pending"
  };

  const pay = async (e) => {
    e.preventDefault();
    setErr('');

    if (!/^\d{10}$/.test(form.phone)) return setErr('Please enter a valid 10-digit phone.');
    if (!/^\d{6}$/.test(form.pincode)) return setErr('Please enter a valid 6-digit pincode.');
    if (!form.name.trim() || !form.city.trim()) return setErr('Please fill all address fields.');

    setBusy(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
        address: form,
        method,
        ...(applied?.coupon ? { couponCode: applied.coupon.code } : {}),
      };

      const { order, paymentMode } = await api('/api/orders', { method: 'POST', body: payload });

      await settlePayment(order, paymentMode);
      clearCart();
      navigate('/orders', { state: { placed: order.orderNumber } });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tightest">Login to checkout</h1>
        <p className="mt-3 text-sm text-neutral-500">
          Accounts keep your orders & tracking secure. Takes 20 seconds.
        </p>
        <Link to="/login" className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust">
          Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tightest">Your bag is empty</h1>
        <p className="mt-3 text-sm text-neutral-500">Add something from the drop first.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">Checkout</p>
      <h1 className="mt-2 mb-10 font-display text-4xl font-semibold tracking-tightest">
        Almost yours.
      </h1>

      <form onSubmit={pay} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Address */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-xl font-semibold">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Full name" value={form.name} onChange={set('name')}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink sm:col-span-2" />
              <input required placeholder="Phone (10 digits)" value={form.phone} onChange={set('phone')}
                inputMode="numeric" maxLength={10}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required placeholder="City" value={form.city} onChange={set('city')}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required placeholder="Pincode" value={form.pincode} onChange={set('pincode')}
                inputMode="numeric" maxLength={6}
                className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
            </div>
          </section>

          {/* Payment */}
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-xl font-semibold">Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod('COD')}
                className={`rounded-2xl border p-4 text-left transition ${
                  method === 'COD' ? 'border-ink bg-ink text-bone' : 'border-ink/15 hover:border-ink'
                }`}
              >
                <p className="text-sm font-bold uppercase tracking-widest">Cash on delivery</p>
                <p className={`mt-1 text-xs ${method === 'COD' ? 'text-bone/60' : 'text-neutral-400'}`}>
                  Pay at your doorstep
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`rounded-2xl border p-4 text-left transition ${
                  method === 'UPI' ? 'border-ink bg-ink text-bone' : 'border-ink/15 hover:border-ink'
                }`}
              >
                <p className="text-sm font-bold uppercase tracking-widest">UPI / Card</p>
                <p className={`mt-1 text-xs ${method === 'UPI' ? 'text-bone/60' : 'text-neutral-400'}`}>
                  Razorpay · secure
                </p>
              </button>
            </div>

            {/* Coupon */}
            <div className="mt-5">
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code (try WELCOME10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm uppercase outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="shrink-0 rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-widest text-bone hover:bg-rust"
                >
                  Apply
                </button>
              </div>
              {couponErr && <p className="mt-2 text-xs font-semibold text-rust">{couponErr}</p>}
              {applied?.coupon && (
                <p className="mt-2 text-xs font-semibold text-green-600">
                  {applied.coupon.code} applied — you save {rupees(applied.discount)}
                </p>
              )}
            </div>
          </section>

          {err && <p className="mt-4 text-sm font-semibold text-rust">{err}</p>}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-3xl bg-ink p-6 text-bone lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map(({ id, qty, product: p }) => (
              <li key={id} className="flex justify-between gap-3">
                <span className="text-bone/70">
                  {p.name} <span className="text-bone/40">× {qty}</span>
                </span>
                <span className="shrink-0">{rupees(p.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-3 border-t border-bone/15 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-bone/60">Items total</dt>
              <dd>{rupees(preview.itemsTotal)}</dd>
            </div>
            {preview.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-bone/60">Coupon discount</dt>
                <dd className="text-rust">− {rupees(preview.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-bone/60">Shipping</dt>
              <dd>{preview.shipping === 0 ? 'Free' : rupees(preview.shipping)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd>{rupees(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={busy}
            className="mt-7 w-full rounded-full bg-bone py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-rust hover:text-bone disabled:opacity-60"
          >
            {busy ? 'Processing…' : method === 'COD' ? 'Place order' : 'Pay now'}
          </button>
          <Link
            to="/cart"
            className="mt-4 block text-center text-xs font-semibold uppercase tracking-widest text-bone/50 hover:text-bone"
          >
            Back to bag
          </Link>
        </aside>
      </form>
    </div>
  );
}
