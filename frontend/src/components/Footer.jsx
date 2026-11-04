export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold tracking-tightest">
            SNEAK<span className="italic font-normal">LAB</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone/50">
            Premium sneakers & streetwear. Designed in Bengaluru, worn everywhere.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-bone/40">Shop</p>
          <ul className="space-y-2 text-sm text-bone/70">
            <li><a href="#">Sneakers</a></li>
            <li><a href="#">Streetwear</a></li>
            <li><a href="#">Bestsellers</a></li>
            <li><a href="#">New Drops</a></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-bone/40">Support</p>
          <ul className="space-y-2 text-sm text-bone/70">
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-bone/40">Join the lab</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex overflow-hidden rounded-full border border-bone/20">
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-bone/30"
            />
            <button className="shrink-0 bg-bone px-5 text-xs font-bold uppercase tracking-widest text-ink transition hover:bg-rust hover:text-bone">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-bone/10 px-5 py-5 text-center text-xs text-bone/40 lg:px-8">
        © {new Date().getFullYear()} SNEAKLAB. All rights reserved · Frontend demo build.
      </div>
    </footer>
  );
}
