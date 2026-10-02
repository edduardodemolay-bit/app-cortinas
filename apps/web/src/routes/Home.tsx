import { formatBRL } from '@cortinas/shared';
import { Link } from 'react-router';

export function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-3xl font-bold">Orçamentos</h1>
      <section className="flex flex-1 flex-col justify-center gap-2">
        <p className="text-xl font-semibold">Nenhum orçamento ainda</p>
        <p className="text-muted">Total em aberto: {formatBRL(0)}</p>
      </section>
      <Link
        to="/simular"
        className="flex min-h-14 items-center justify-center rounded-xl border-2 border-primary text-xl font-bold text-primary active:opacity-80"
      >
        Simular um item
      </Link>
      <button
        type="button"
        disabled
        className="min-h-14 rounded-xl bg-primary text-xl font-bold text-white opacity-50"
      >
        Novo orçamento (em breve)
      </button>
    </main>
  );
}
