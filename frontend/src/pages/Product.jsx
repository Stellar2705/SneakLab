import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { rupees, discount } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../data/useProducts.js';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products } = useProducts();

  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setP(null);
    setErr('');
    setSize(null);
    setQty(1);
    api(`/api/products/${id}`)
      .then((d) => setP(d.product))
      .catch((ex) => setErr(ex.message));
  }, [id]);

  if (err) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center lg:px-8">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/" className="mt-4 inline-block underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-white" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-white" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-white" />
            <div className="h-8 w-40 animate-pulse rounded bg-white" />
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  const pid = String(p._id);

  const add = (andGo) => {
    if (!size) return alert('Please pick a size first.');
    addItem(p, qty);
    if (andGo) navigate('/cart');
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <nav className="mb-6 text-xs uppercase tracking-widest text-neutral-400">
        <Link to="/" className="hover:text-ink">Home</Link> / {p.category} /{' '}
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {(p.images?.length ? p.images : ['']).map((src, i) => (
            <div key={i} className="overflow-hidden rounded-3xl bg-white">
              <img src={src} alt={`${p.name} ${i + 1}`} className="aspect-[4/3] w-full object-cover" />            </div>
          ))}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            {p.category} · ★ {p.rating} rated
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tightest sm:text-5xl">
            {p.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{rupees(p.price)}</span>
            <span className="text-lg text-neutral-400 line-through">{rupees(p.mrp)}</span>
            <span className="rounded-full bg-rust/10 px-3 py-1 text-sm font-bold text-rust">
              {discount(p)}% OFF
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">MRP inclusive of all taxes</p>

          <p className="mt-6 max-w-lg leading-relaxed text-neutral-600">{p.description}</p>

          {/* Size */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.25em]">Select size</p>
              <button type="button" className="text-xs underline text-neutral-400">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-14 rounded-xl border px-3 text-sm font-semibold transition ${
                    size === s
                      ? 'border-ink bg-ink text-bone'
                      : 'border-ink/15 bg-white hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 rounded-l-full text-lg font-bold hover:bg-ink hover:text-bone"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                className="h-11 w-11 rounded-r-full text-lg font-bold hover:bg-ink hover:text-bone"
              >
                +
              </button>
            </div>
            <button
              onClick={() => add(true)}
              className="h-11 flex-1 rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust sm:flex-none sm:px-10"
            >
              Add to bag · {rupees(p.price * qty)}
            </button>
            <button
              onClick={() => add(false)}
              className="h-11 flex-1 rounded-full border border-ink px-6 text-sm font-bold uppercase tracking-widest transition hover:bg-ink hover:text-bone sm:flex-none sm:px-10"
            >
              Buy now
            </button>
          </div>
          <p className="mt-3 text-xs font-semibold text-rust">
            {p.stock <= 12 ? `Only ${p.stock} left` : `${p.stock} in stock`} · ships within 24h
          </p>
        </div>
      </div>

      {/* Related */}
      <section className="mt-20">
        <h2 className="mb-8 font-display text-3xl font-semibold tracking-tightest">
          You may also like
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((x) => String(x._id) !== pid)
            .slice(0, 3)
            .map((x) => (
              <ProductCard key={x._id} p={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
