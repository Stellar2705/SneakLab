import { useState } from 'react';
import Hero from '../components/Hero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../data/useProducts.js';

const categories = ['All', 'Sneakers', 'Streetwear'];

export default function Home() {
  const { products, loading } = useProducts();
  const [cat, setCat] = useState('All');
  const list =
    cat === 'All' ? products : products.filter((p) => p.category === cat);

  return (
    <div>
      <Hero />

      {/* Value strip */}
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:grid-cols-3 lg:px-8">
        {[
          ['Crafted, not mass-made', 'Small-batch releases with premium materials and signature hardware.'],
          ['100-day wear test', 'Wear them. Sweat in them. Not in love? Full refund on us.'],
          ['Ships in 24h', 'Dispatch inside 24 hours, pan-India delivery in 2–5 days.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{body}</p>
          </div>
        ))}
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8" id="bestsellers">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">
              The Collection
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tightest sm:text-5xl">
              Shop the drop
            </h2>
          </div>
          <div className="flex gap-2 rounded-full border border-ink/10 bg-white p-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  cat === c ? 'bg-ink text-bone' : 'text-neutral-500 hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-white" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-400">
            Nothing here yet — run <code className="font-mono">npm run seed</code> in backend first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial banner */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-bone/40">
            Drop 05 — Preview
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tightest sm:text-6xl">
            The <span className="italic font-normal text-rust">Court Series</span> returns this
            season.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-bone/60">
            Limited to 500 pairs worldwide. Sign up in the footer for first access.
          </p>
        </div>
      </section>
    </div>
  );
}
