export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:py-28 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="animate-fadeUp">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-bone/50">
            Drop 04 — Now Live
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tightest sm:text-6xl lg:text-8xl">
            Engineered
            <br />
            for the <span className="italic font-normal text-rust">streets</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-bone/70 sm:text-lg">
            Premium sneakers & heavyweight streetwear, crafted in small batches. No restocks,
            no compromises.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#bestsellers"
              className="rounded-full bg-bone px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-rust hover:text-bone"
            >
              Shop Flagship
            </a>
            <a
              href="#bestsellers"
              className="rounded-full border border-bone/30 px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition hover:border-bone"
            >
              The Line-Up
            </a>
          </div>
        </div>

        <div className="relative animate-fadeUp [animation-delay:150ms]">
          <div className="overflow-hidden rounded-[2.5rem]">
            <img
              src="/products/p1a.jpg"
              alt="Velocity Air Midnight"
              className="h-64 w-full object-cover sm:h-80 lg:h-[520px]"
            />
          </div>
          <div className="absolute bottom-4 left-4 rounded-2xl bg-bone/10 px-5 py-3 backdrop-blur-lg">
            <p className="text-xs uppercase tracking-widest text-bone/60">Flagship</p>
            <p className="font-display text-lg">Velocity Air — ₹7,499</p>
          </div>
        </div>
      </div>

      <div className="border-t border-bone/10 py-4">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap font-display text-2xl italic text-bone/40">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-8">
                Free shipping over ₹3,000 · COD available · 7-day easy returns ·
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
