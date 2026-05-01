import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArrowLeft, GraduationCap, BookOpen, User } from 'lucide-react';
import { useHistoricoEscolarPage } from './hooks/useHistoricoEscolarPage';

export function HistoricoEscolarPage() {
  const navigate = useNavigate();
  const { alunoId, aluno, historico, isLoading, selectedAno, setSelectedAno, selectedHistorico, disciplinasArray, loadData } = useHistoricoEscolarPage();

  useEffect(() => { if (alunoId) loadData(); }, [alunoId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      CURSANDO: 'info', APROVADO: 'success', REPROVADO: 'danger', TRANSFERIDO: 'warning', CANCELADO: 'danger',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const notasColumns = [
    { key: 'disciplina', header: 'Disciplina' },
    { key: 'professor', header: 'Professor' },
    { key: 'b1', header: '1º Bim', render: (row: any) => row.bimestres[1]?.toFixed(1) || '-' },
    { key: 'b2', header: '2º Bim', render: (row: any) => row.bimestres[2]?.toFixed(1) || '-' },
    { key: 'b3', header: '3º Bim', render: (row: any) => row.bimestres[3]?.toFixed(1) || '-' },
    { key: 'b4', header: '4º Bim', render: (row: any) => row.bimestres[4]?.toFixed(1) || '-' },
    {
      key: 'media', header: 'Média',
      render: (row: any) => {
        const notas = [1, 2, 3, 4].map((b) => row.bimestres[b]).filter((n) => n != null);
        if (notas.length === 0) return '-';
        const media = notas.reduce((a: number, b: number) => a + b, 0) / notas.length;
        return <span className={media >= 6 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{media.toFixed(1)}</span>;
      },
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  if (!aluno) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aluno não encontrado</p>
        <Button onClick={() => navigate('/alunos')} className="mt-4"><ArrowLeft size={18} /> Voltar para Alunos</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/alunos')}><ArrowLeft size={18} /></Button>
        <h1 className="text-2xl font-bold text-gray-900">Histórico Escolar</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-full"><User size={24} className="text-primary-600" /></div>
            <div>
              <h2 className="text-xl font-semibold">{aluno.nome}</h2>
              {(aluno as any).responsavel_nome && <p className="text-gray-500 text-sm">Responsável: {(aluno as any).responsavel_nome}</p>}
            </div>
          </div>
        </CardHeader>
      </Card>

      {historico.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum histórico escolar encontrado</p>
            <p className="text-gray-400 text-sm mt-2">O aluno ainda não foi vinculado a nenhuma turma</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {historico.map((h) => (
              <Button key={h.ano_letivo} variant={selectedAno === h.ano_letivo ? 'primary' : 'secondary'} onClick={() => setSelectedAno(h.ano_letivo)}>
                {h.ano_letivo}
              </Button>
            ))}
          </div>

          {selectedHistorico && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap size={24} className="text-primary-600" />
                      <div>
                        <h3 className="text-lg font-semibold">{selectedHistorico.turma_nome}</h3>
                        <p className="text-gray-500 text-sm">{selectedHistorico.turma_serie} - {selectedHistorico.turma_turno}</p>
                      </div>
                    </div>
                    {getStatusBadge(selectedHistorico.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Data de Entrada:</span>
                      <p className="font-medium">{new Date(selectedHistorico.data_entrada).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {selectedHistorico.data_saida && (
                      <div>
                        <span className="text-gray-500">Data de Saída:</span>
                        <p className="font-medium">{new Date(selectedHistorico.data_saida).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedHistorico.professores && selectedHistorico.professores.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><User size={20} /> Professores</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedHistorico.professores.map((prof: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User size={18} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium">{prof.professor_nome}</p>
                            <p className="text-sm text-gray-500">{prof.disciplina || 'Geral'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><BookOpen size={20} /> Notas por Disciplina</h3>
                </CardHeader>
                <CardContent className="p-0">
                  {disciplinasArray.length > 0 ? (
                    <Table data={disciplinasArray} columns={notasColumns} keyExtractor={(row: any) => row.disciplina} />
                  ) : (
                    <div className="py-8 text-center text-gray-500">Nenhuma nota registrada para este ano letivo</div>
                  )}
                </CardContent>
              </Card>

              {selectedHistorico.observacoes && (
                <Card>
                  <CardHeader><h3 className="text-lg font-semibold">Observações</h3></CardHeader>
                  <CardContent><p className="text-gray-600">{selectedHistorico.observacoes}</p></CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
