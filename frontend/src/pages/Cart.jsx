import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { rupees } from '../utils/format.js';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, mrpTotal, clearCart } = useCart();
  const saved = mrpTotal - subtotal;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center lg:px-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">
          Your bag
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tightest">
          Nothing here yet.
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          The drop is live — premium sneakers & streetwear await.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust"
        >
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">Your bag</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tightest">
            {items.length} item{items.length > 1 ? 's' : ''}
          </h1>
        </div>
        <button onClick={clearCart} className="text-xs font-semibold uppercase tracking-widest text-neutral-400 underline hover:text-rust">
          Clear all
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div>
          {items.map(({ product: p, id, qty }) => (
            <div
              key={id}
              className="mb-4 flex gap-4 rounded-3xl bg-white p-4 shadow-sm sm:gap-6 sm:p-5"
            >
              <Link to={`/product/${p.id}`} className="shrink-0 self-start">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-display font-semibold leading-snug">{p.name}</h3>
                </Link>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-neutral-400">
                  {p.category}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button
                      onClick={() => updateQty(id, qty - 1)}
                      className="h-9 w-9 rounded-l-full text-lg font-bold transition hover:bg-ink hover:text-bone"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => updateQty(id, qty + 1)}
                      className="h-9 w-9 rounded-r-full text-lg font-bold transition hover:bg-ink hover:text-bone"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{rupees(p.price * qty)}</p>
                    <p className="text-xs text-neutral-400 line-through">{rupees(p.mrp * qty)}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeItem(id)}
                className="self-start p-1 text-neutral-300 transition hover:text-rust"
                aria-label="Remove"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-3xl bg-ink p-6 text-bone lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-bone/60">Items total</dt>
              <dd>{rupees(mrpTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bone/60">Sneaklab savings</dt>
              <dd className="text-rust">− {rupees(saved)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bone/60">Shipping</dt>
              <dd>{subtotal >= 3000 ? 'Free' : rupees(149)}</dd>
            </div>
            <div className="border-t border-bone/15 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <dt>Total</dt>
                <dd>{rupees(subtotal + (subtotal >= 3000 ? 0 : 149))}</dd>
              </div>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="mt-8 block rounded-full bg-bone py-3.5 text-center text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-rust hover:text-bone"
          >
            Checkout
          </Link>
          <Link
            to="/"
            className="mt-4 block text-center text-xs font-semibold uppercase tracking-widest text-bone/50 hover:text-bone"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
