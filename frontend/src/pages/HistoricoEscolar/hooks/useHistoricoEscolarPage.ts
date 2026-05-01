import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { historicoEscolarService, HistoricoEscolar } from '../../../services/historicoEscolarService';
import { alunoService } from '../../../services/alunoService';
import { Aluno } from '../../../types';
import toast from 'react-hot-toast';

export function useHistoricoEscolarPage() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [historico, setHistorico] = useState<HistoricoEscolar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAno, setSelectedAno] = useState<number | null>(null);

  async function loadData() {
    if (!alunoId) return;
    try {
      const [alunoData, historicoData] = await Promise.all([
        alunoService.obterPorId(alunoId),
        historicoEscolarService.buscarHistoricoAluno(alunoId),
      ]);
      setAluno(alunoData);
      setHistorico(historicoData);
      if (historicoData.length > 0) {
        setSelectedAno(historicoData[0].ano_letivo);
      }
    } catch {
      toast.error('Erro ao carregar histórico escolar');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedHistorico = historico.find((h) => h.ano_letivo === selectedAno);

  const notasPorDisciplina = selectedHistorico?.notas?.reduce((acc: any, nota: any) => {
    if (!acc[nota.disciplina]) {
      acc[nota.disciplina] = { disciplina: nota.disciplina, professor: nota.professor_nome, bimestres: {} };
    }
    acc[nota.disciplina].bimestres[nota.bimestre] = nota.nota;
    return acc;
  }, {}) || {};

  const disciplinasArray = Object.values(notasPorDisciplina);

  return {
    alunoId,
    aluno,
    historico,
    isLoading,
    selectedAno,
    setSelectedAno,
    selectedHistorico,
    disciplinasArray,
    loadData,
  };
}
