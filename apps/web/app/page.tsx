import { formatBRL } from '@cortinas/shared';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-3xl font-bold">Proposta</h1>
      <p className="text-lg text-neutral-600">
        Abra o link que você recebeu pelo WhatsApp para ver sua proposta.
      </p>
      <p className="text-sm text-neutral-500">Exemplo de valor: {formatBRL(123456)}</p>
    </main>
  );
}
