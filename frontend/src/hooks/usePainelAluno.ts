import { useState } from 'react';

/**
 * Hook simples para controlar a abertura do PainelAlunoModal.
 *
 * Uso:
 *   const { alunoId, openPainel, closePainel } = usePainelAluno();
 *   <PainelAlunoModal alunoId={alunoId} onClose={closePainel} />
 */
export function usePainelAluno() {
  const [alunoId, setAlunoId] = useState<string | null>(null);

  return {
    alunoId,
    openPainel: (id: string) => setAlunoId(id),
    closePainel: () => setAlunoId(null),
  };
}
