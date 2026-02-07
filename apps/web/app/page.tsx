export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Orbital PoC</h1>
      <p className="mt-2 text-slate-700">
        Dev-only spike harness routes live under <code>/__spikes</code>.
      </p>

      <ul className="mt-6 list-disc pl-5 text-slate-800">
        <li>
          <a className="underline" href="/__spikes/rh1-pdf-perf">
            RH1: pdf.js perf harness
          </a>
        </li>
        <li>
          <a className="underline" href="/__spikes/rh2-overlay">
            RH2: highlight overlay harness
          </a>
        </li>
      </ul>
    </main>
  );
}

