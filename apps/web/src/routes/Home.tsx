import { formatBRL } from '@cortinas/shared';

export function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-3xl font-bold">Orçamentos</h1>
      <section className="flex flex-1 flex-col justify-center gap-2">
        <p className="text-xl font-semibold">Nenhum orçamento ainda</p>
        <p className="text-muted">Total em aberto: {formatBRL(0)}</p>
      </section>
      <button
        type="button"
        className="min-h-14 rounded-xl bg-primary text-xl font-bold text-white active:opacity-80"
      >
        Novo orçamento
      </button>
    </main>
  );
}
