import { Link, useNavigate } from 'react-router-dom';
import { discount, rupees } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ p }) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <Link to={`/product/${p._id}`} className="relative block overflow-hidden">
        <img
          src={p.images?.[0]}
          alt={p.name}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72"
        />
        {p.isBestseller && (
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bone">
            Bestseller
          </span>
        )}
        {p.stock <= 12 && (
          <span className="absolute right-4 top-4 rounded-full bg-rust px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bone">
            Low stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/product/${p._id}`}>
              <h3 className="font-display text-base font-semibold leading-snug">{p.name}</h3>
            </Link>
            <p className="mt-0.5 text-xs uppercase tracking-widest text-neutral-400">
              {p.category} · ★ {p.rating}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-bold text-rust">
            {discount(p)}% off
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div className="leading-tight">
            <p className="text-lg font-bold">{rupees(p.price)}</p>
            <p className="text-xs text-neutral-400 line-through">{rupees(p.mrp)}</p>
          </div>
          <button
            onClick={() => {
              addItem(p, 1);
              navigate('/cart');
            }}
            className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-widest text-bone transition hover:bg-rust"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
