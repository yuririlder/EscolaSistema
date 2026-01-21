import { pool, query, queryOne, queryMany } from '../database/connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class FinanceiroService {
  // ==================== PLANOS ====================
  
  async criarPlano(data: any) {
    const id = uuidv4();
    await query(
      `INSERT INTO planos_mensalidade (id, nome, descricao, valor, ativo)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, data.nome, data.descricao, data.valor, data.ativo !== false]
    );
    logger.info(`Plano criado: ${data.nome}`);
    return this.buscarPlanoPorId(id);
  }

  async listarPlanos() {
    return await queryMany('SELECT * FROM planos_mensalidade ORDER BY nome ASC');
  }

  async listarPlanosAtivos() {
    return await queryMany('SELECT * FROM planos_mensalidade WHERE ativo = true ORDER BY nome ASC');
  }

  async buscarPlanoPorId(id: string) {
    return await queryOne('SELECT * FROM planos_mensalidade WHERE id = $1', [id]);
  }

  async atualizarPlano(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const campos = ['nome', 'descricao', 'valor', 'ativo'];
    for (const campo of campos) {
      if (data[campo] !== undefined) {
        fields.push(`${campo} = $${paramIndex++}`);
        values.push(data[campo]);
      }
    }

    if (fields.length === 0) {
      return this.buscarPlanoPorId(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(
      `UPDATE planos_mensalidade SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return this.buscarPlanoPorId(id);
  }

  async deletarPlano(id: string): Promise<void> {
    // Soft delete - apenas desativa para manter histórico de matrículas
    await query('UPDATE planos_mensalidade SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    logger.info(`Plano desativado: ${id}`);
  }

  // ==================== MATRÍCULAS ====================

  async realizarMatricula(data: any) {
    // Verificar se aluno existe
    const aluno = await queryOne('SELECT id, nome FROM alunos WHERE id = $1', [data.aluno_id]);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar se aluno já está matriculado no mesmo ano letivo
    const matriculaExistente = await queryOne(
      `SELECT id FROM matriculas 
       WHERE aluno_id = $1 AND ano_letivo = $2 AND status != 'CANCELADA'`,
      [data.aluno_id, data.ano_letivo]
    );
    if (matriculaExistente) {
      throw new Error(`Este aluno já possui matrícula ativa no ano letivo ${data.ano_letivo}`);
    }

    // Verificar se plano existe
    const plano = await this.buscarPlanoPorId(data.plano_id);
    if (!plano) {
      throw new Error('Plano não encontrado');
    }

    const valorMensalidade = plano.valor;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const matriculaId = uuidv4();
      const dataMatricula = new Date().toISOString().split('T')[0];

      // Criar matrícula
      await client.query(
        `INSERT INTO matriculas (id, aluno_id, plano_id, ano_letivo, valor_matricula, valor_mensalidade, dia_vencimento, data_matricula, status, desconto, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ATIVA', $9, $10)`,
        [matriculaId, data.aluno_id, data.plano_id, data.ano_letivo, data.valor_matricula, valorMensalidade, data.dia_vencimento || 10, dataMatricula, 0, data.observacoes]
      );

      // Atualizar aluno como matriculado
      await client.query(
        "UPDATE alunos SET matricula_ativa = true, data_matricula = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [dataMatricula, data.aluno_id]
      );

      // Gerar mensalidades do ano
      const anoAtual = data.ano_letivo;
      const mesInicio = new Date().getMonth() + 1;
      const valorMatricula = data.valor_matricula || 0;
      
      let isPrimeiraMensalidade = true;
      for (let mes = mesInicio; mes <= 12; mes++) {
        const diaVenc = data.dia_vencimento || 10;
        const dataVencimento = `${anoAtual}-${String(mes).padStart(2, '0')}-${String(diaVenc).padStart(2, '0')}`;
        
        // Na primeira mensalidade, abater o valor da matrícula
        let valorMensalidadeFinal = valorMensalidade;
        if (isPrimeiraMensalidade && valorMatricula > 0) {
          valorMensalidadeFinal = Math.max(0, valorMensalidade - valorMatricula);
          isPrimeiraMensalidade = false;
        }
        
        await client.query(
          `INSERT INTO mensalidades (id, aluno_id, matricula_id, mes_referencia, ano_referencia, valor, desconto, data_vencimento, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDENTE')`,
          [uuidv4(), data.aluno_id, matriculaId, mes, anoAtual, valorMensalidadeFinal, 0, dataVencimento]
        );
      }

      await client.query('COMMIT');

      logger.info(`Matrícula realizada para aluno ${aluno.nome}`);
      return this.buscarMatriculaPorId(matriculaId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listarMatriculas() {
    return await queryMany(
      `SELECT m.*, a.nome as aluno_nome, p.nome as plano_nome
       FROM matriculas m
       INNER JOIN alunos a ON m.aluno_id = a.id
       INNER JOIN planos_mensalidade p ON m.plano_id = p.id
       ORDER BY m.data_matricula DESC`
    );
  }

  async buscarMatriculaPorId(id: string) {
    return await queryOne(
      `SELECT m.*, a.nome as aluno_nome, p.nome as plano_nome
       FROM matriculas m
       INNER JOIN alunos a ON m.aluno_id = a.id
       INNER JOIN planos_mensalidade p ON m.plano_id = p.id
       WHERE m.id = $1`,
      [id]
    );
  }

  async atualizarMatricula(id: string, data: any) {
    const matricula = await this.buscarMatriculaPorId(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const camposPermitidos = [
      { campo: 'plano_id', valor: data.plano_id },
      { campo: 'ano_letivo', valor: data.ano_letivo },
      { campo: 'valor_matricula', valor: data.valor_matricula },
      { campo: 'desconto', valor: data.desconto },
      { campo: 'status', valor: data.status },
      { campo: 'observacoes', valor: data.observacoes },
    ];

    for (const { campo, valor } of camposPermitidos) {
      if (valor !== undefined) {
        fields.push(`${campo} = $${paramIndex++}`);
        values.push(valor);
      }
    }

    if (fields.length === 0) {
      return this.buscarMatriculaPorId(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(
      `UPDATE matriculas SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    logger.info(`Matrícula atualizada: ${id}`);
    return this.buscarMatriculaPorId(id);
  }

  async cancelarMatricula(id: string) {
    const matricula = await this.buscarMatriculaPorId(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    await query(
      "UPDATE matriculas SET status = 'CANCELADA', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    await query(
      "UPDATE alunos SET matricula_ativa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [matricula.aluno_id]
    );

    // Cancelar apenas mensalidades FUTURAS (que ainda não venceram)
    // Mensalidades vencidas devem ser preservadas para cobrança
    await query(
      "UPDATE mensalidades SET status = 'CANCELADO', updated_at = CURRENT_TIMESTAMP WHERE matricula_id = $1 AND status = 'PENDENTE' AND data_vencimento >= CURRENT_DATE",
      [id]
    );

    logger.info(`Matrícula cancelada: ${id}`);
    return this.buscarMatriculaPorId(id);
  }

  // ==================== MENSALIDADES ====================

  /**
   * Calcula o status real da mensalidade baseado na data atual
   * - PAGO: já foi paga
   * - VENCIDA: data de vencimento passou e não foi paga
   * - PENDENTE: mês atual, ainda não venceu
   * - FUTURA: meses futuros
   */
  private calcularStatusMensalidade(mensalidade: any): string {
    // Se já está paga ou cancelada, mantém
    if (mensalidade.status === 'PAGO' || mensalidade.status === 'CANCELADO') {
      return mensalidade.status;
    }

    const hoje = new Date();
    const dataVencimento = new Date(mensalidade.data_vencimento);
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    // Zerar horas para comparação de datas
    hoje.setHours(0, 0, 0, 0);
    dataVencimento.setHours(0, 0, 0, 0);

    // Se a data de vencimento já passou, está vencida
    if (dataVencimento < hoje) {
      return 'VENCIDA';
    }

    // Se é do mês atual e ano atual, está pendente
    if (mensalidade.mes_referencia === mesAtual && mensalidade.ano_referencia === anoAtual) {
      return 'PENDENTE';
    }

    // Se é de mês/ano futuro, é futura
    if (mensalidade.ano_referencia > anoAtual || 
        (mensalidade.ano_referencia === anoAtual && mensalidade.mes_referencia > mesAtual)) {
      return 'FUTURA';
    }

    // Se é de mês passado mas não venceu (improvável), marca como pendente
    return 'PENDENTE';
  }

  async listarMensalidades(filtros: { mes?: number; ano?: number; status?: string }) {
    let sql = `
      SELECT m.*, a.nome as aluno_nome
      FROM mensalidades m
      INNER JOIN alunos a ON m.aluno_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.mes) {
      sql += ` AND m.mes_referencia = $${paramIndex++}`;
      params.push(filtros.mes);
    }
    if (filtros.ano) {
      sql += ` AND m.ano_referencia = $${paramIndex++}`;
      params.push(filtros.ano);
    }
    
    // Filtro de status será aplicado após calcular o status real
    const statusFiltro = filtros.status;

    sql += ' ORDER BY m.data_vencimento DESC';
    const mensalidades = await queryMany(sql, params);

    // Calcular status real de cada mensalidade
    const mensalidadesComStatus = mensalidades.map((m: any) => ({
      ...m,
      status_original: m.status,
      status: this.calcularStatusMensalidade(m)
    }));

    // Filtrar por status se especificado
    if (statusFiltro) {
      return mensalidadesComStatus.filter((m: any) => m.status === statusFiltro);
    }

    return mensalidadesComStatus;
  }

  async listarInadimplentes() {
    const mensalidades = await queryMany(
      `SELECT m.*, a.nome as aluno_nome, r.nome as responsavel_nome, r.telefone, r.celular, r.email
       FROM mensalidades m
       INNER JOIN alunos a ON m.aluno_id = a.id
       INNER JOIN responsaveis r ON a.responsavel_id = r.id
       WHERE m.status NOT IN ('PAGO', 'CANCELADO') AND m.data_vencimento < CURRENT_DATE
       ORDER BY m.data_vencimento ASC`
    );
    
    // Calcular status real
    return mensalidades.map((m: any) => ({
      ...m,
      status: this.calcularStatusMensalidade(m)
    }));
  }

  async buscarMensalidadePorId(id: string) {
    const mensalidade = await queryOne(
      `SELECT m.*, a.nome as aluno_nome
       FROM mensalidades m
       INNER JOIN alunos a ON m.aluno_id = a.id
       WHERE m.id = $1`,
      [id]
    );
    
    if (mensalidade) {
      return {
        ...mensalidade,
        status_original: mensalidade.status,
        status: this.calcularStatusMensalidade(mensalidade)
      };
    }
    return null;
  }

  async registrarPagamentoMensalidade(id: string, data: any) {
    const mensalidade = await this.buscarMensalidadePorId(id);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }

    let valorBase = parseFloat(mensalidade.valor) || 0;
    let descontoAplicado = 0;
    let acrescimoAplicado = 0;
    const observacoes: string[] = [];
    const dataAtual = new Date().toISOString();

    // Aplicar desconto se informado
    if (data.desconto && data.desconto.valor > 0) {
      if (!data.desconto.motivo || data.desconto.motivo.trim().length === 0) {
        throw new Error('É necessário informar o motivo do desconto');
      }
      if (data.desconto.tipo === 'percentual') {
        descontoAplicado = valorBase * (data.desconto.valor / 100);
      } else {
        descontoAplicado = data.desconto.valor;
      }
      observacoes.push(`[${dataAtual}] Desconto aplicado: R$ ${descontoAplicado.toFixed(2)} (${data.desconto.tipo === 'percentual' ? data.desconto.valor + '%' : 'valor fixo'}). Motivo: ${data.desconto.motivo}`);
    }

    // Aplicar acréscimo se informado
    if (data.acrescimo && data.acrescimo.valor > 0) {
      if (!data.acrescimo.motivo || data.acrescimo.motivo.trim().length === 0) {
        throw new Error('É necessário informar o motivo do acréscimo');
      }
      if (data.acrescimo.tipo === 'percentual') {
        acrescimoAplicado = valorBase * (data.acrescimo.valor / 100);
      } else {
        acrescimoAplicado = data.acrescimo.valor;
      }
      observacoes.push(`[${dataAtual}] Acréscimo aplicado: R$ ${acrescimoAplicado.toFixed(2)} (${data.acrescimo.tipo === 'percentual' ? data.acrescimo.valor + '%' : 'valor fixo'}). Motivo: ${data.acrescimo.motivo}`);
    }

    // Calcular valor final
    const valorPago = data.valor_pago || Math.max(0, valorBase - descontoAplicado + acrescimoAplicado);

    // Preparar observações
    const observacoesAtuais = mensalidade.observacoes || '';
    const novasObservacoes = observacoes.length > 0 
      ? (observacoesAtuais ? observacoesAtuais + '\n' : '') + observacoes.join('\n')
      : observacoesAtuais;

    const dataPagamento = new Date().toISOString().split('T')[0];
    await query(
      `UPDATE mensalidades SET 
        status = 'PAGO', 
        valor_pago = $1, 
        data_pagamento = $2, 
        forma_pagamento = $3, 
        desconto = $4,
        acrescimo = $5,
        observacoes = $6,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7`,
      [valorPago, dataPagamento, data.forma_pagamento, descontoAplicado, acrescimoAplicado, novasObservacoes, id]
    );

    logger.info(`Pagamento de mensalidade registrado: ${id}, valor: ${valorPago}, desconto: ${descontoAplicado}, acrescimo: ${acrescimoAplicado}`);
    return this.buscarMensalidadePorId(id);
  }

  /**
   * Altera o valor de uma mensalidade futura
   * Apenas mensalidades com status FUTURA podem ter o valor alterado
   */
  async alterarValorMensalidade(id: string, data: { valor: number; motivo: string; aplicarEmTodas?: boolean }) {
    const mensalidade = await this.buscarMensalidadePorId(id);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }

    // Verificar se a mensalidade é futura
    const statusAtual = this.calcularStatusMensalidade(mensalidade);
    if (statusAtual !== 'FUTURA') {
      throw new Error('Apenas mensalidades futuras podem ter o valor alterado');
    }

    if (!data.valor || data.valor <= 0) {
      throw new Error('O valor deve ser maior que zero');
    }

    if (!data.motivo || data.motivo.trim().length === 0) {
      throw new Error('É necessário informar o motivo da alteração');
    }

    // Salvar o valor anterior e o motivo da alteração nas observações
    const valorAnterior = parseFloat(mensalidade.valor) || 0;
    const novoValor = parseFloat(data.valor.toString()) || 0;
    const dataAlteracao = new Date().toISOString();
    const observacaoAlteracao = `[${dataAlteracao}] Valor alterado de R$ ${valorAnterior.toFixed(2)} para R$ ${novoValor.toFixed(2)}. Motivo: ${data.motivo}`;
    
    if (data.aplicarEmTodas) {
      // Aplicar em todas as mensalidades futuras do mesmo aluno
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      
      // Buscar todas as mensalidades futuras do aluno (não pagas e com data futura)
      const mensalidadesFuturas = await queryMany(
        `SELECT id, observacoes FROM mensalidades 
         WHERE aluno_id = $1 
         AND status NOT IN ('PAGO', 'CANCELADO')
         AND (ano_referencia > $2 OR (ano_referencia = $2 AND mes_referencia > $3))`,
        [mensalidade.aluno_id, anoAtual, mesAtual]
      );

      // Atualizar cada mensalidade futura
      for (const m of mensalidadesFuturas) {
        const obsAtuais = m.observacoes || '';
        const novasObs = obsAtuais ? `${obsAtuais}\n${observacaoAlteracao}` : observacaoAlteracao;
        
        await query(
          `UPDATE mensalidades 
           SET valor = $1, observacoes = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [novoValor, novasObs, m.id]
        );
      }

      logger.info(`Valor de ${mensalidadesFuturas.length} mensalidades futuras do aluno ${mensalidade.aluno_id} alterado para ${novoValor}. Motivo: ${data.motivo}`);
    } else {
      // Aplicar apenas na mensalidade selecionada
      const observacoesAtuais = mensalidade.observacoes || '';
      const novasObservacoes = observacoesAtuais 
        ? `${observacoesAtuais}\n${observacaoAlteracao}`
        : observacaoAlteracao;

      await query(
        `UPDATE mensalidades 
         SET valor = $1, observacoes = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [novoValor, novasObservacoes, id]
      );

      logger.info(`Valor da mensalidade ${id} alterado de ${valorAnterior} para ${novoValor}. Motivo: ${data.motivo}`);
    }

    return this.buscarMensalidadePorId(id);
  }

  // ==================== DESPESAS ====================

  async criarDespesa(data: any) {
    const id = uuidv4();
    await query(
      `INSERT INTO despesas (id, descricao, categoria, valor, data_vencimento, fornecedor, observacoes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDENTE')`,
      [id, data.descricao, data.categoria, data.valor, data.data_vencimento, data.fornecedor, data.observacoes]
    );
    logger.info(`Despesa criada: ${data.descricao}`);
    return this.buscarDespesaPorId(id);
  }

  async listarDespesas(filtros: { mes?: number; ano?: number; categoria?: string }) {
    let sql = 'SELECT * FROM despesas WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.mes) {
      sql += ` AND EXTRACT(MONTH FROM data_vencimento) = $${paramIndex++}`;
      params.push(filtros.mes);
    }
    if (filtros.ano) {
      sql += ` AND EXTRACT(YEAR FROM data_vencimento) = $${paramIndex++}`;
      params.push(filtros.ano);
    }
    if (filtros.categoria) {
      sql += ` AND categoria = $${paramIndex++}`;
      params.push(filtros.categoria);
    }

    sql += ' ORDER BY data_vencimento DESC';
    return await queryMany(sql, params);
  }

  async buscarDespesaPorId(id: string) {
    return await queryOne('SELECT * FROM despesas WHERE id = $1', [id]);
  }

  async atualizarDespesa(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const campos = ['descricao', 'categoria', 'valor', 'data_vencimento', 'fornecedor', 'observacoes', 'status'];
    for (const campo of campos) {
      if (data[campo] !== undefined) {
        fields.push(`${campo} = $${paramIndex++}`);
        values.push(data[campo]);
      }
    }

    if (fields.length === 0) {
      return this.buscarDespesaPorId(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(
      `UPDATE despesas SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return this.buscarDespesaPorId(id);
  }

  async pagarDespesa(id: string, data?: any) {
    const dataPagamento = new Date().toISOString().split('T')[0];
    const formaPagamento = data?.forma_pagamento || 'PIX';
    await query(
      "UPDATE despesas SET status = 'PAGO', data_pagamento = $1, forma_pagamento = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [dataPagamento, id, formaPagamento]
    );
    return this.buscarDespesaPorId(id);
  }

  async deletarDespesa(id: string): Promise<void> {
    // Soft delete - apenas marca como cancelado para manter histórico
    await query("UPDATE despesas SET status = 'CANCELADO', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
    logger.info(`Despesa cancelada: ${id}`);
  }

  // ==================== PAGAMENTOS FUNCIONÁRIOS ====================

  async criarPagamentoFuncionario(data: any) {
    const id = uuidv4();
    const valorLiquido = data.salario_base + (data.bonus || 0) - (data.descontos || 0);
    
    await query(
      `INSERT INTO pagamentos_funcionarios (id, funcionario_id, mes_referencia, ano_referencia, salario_base, bonus, descontos, valor_liquido, status, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDENTE', $9)`,
      [id, data.funcionario_id, data.mes_referencia, data.ano_referencia, data.salario_base, data.bonus || 0, data.descontos || 0, valorLiquido, data.observacoes]
    );
    
    logger.info(`Pagamento criado para funcionário ${data.funcionario_id}`);
    return this.buscarPagamentoPorId(id);
  }

  async gerarPagamentosMes(mes: number, ano: number) {
    const funcionarios = await queryMany(
      'SELECT id, salario FROM funcionarios WHERE ativo = true'
    );

    const pagamentos = [];
    for (const func of funcionarios) {
      // Verificar se já existe pagamento
      const existe = await queryOne(
        'SELECT id FROM pagamentos_funcionarios WHERE funcionario_id = $1 AND mes_referencia = $2 AND ano_referencia = $3',
        [func.id, mes, ano]
      );

      if (!existe) {
        const pag = await this.criarPagamentoFuncionario({
          funcionario_id: func.id,
          mes_referencia: mes,
          ano_referencia: ano,
          salario_base: func.salario
        });
        pagamentos.push(pag);
      }
    }

    return pagamentos;
  }

  async listarPagamentosFuncionarios(filtros: { mes?: number; ano?: number }) {
    let sql = `
      SELECT pf.*, f.nome as funcionario_nome, f.cargo
      FROM pagamentos_funcionarios pf
      INNER JOIN funcionarios f ON pf.funcionario_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.mes) {
      sql += ` AND pf.mes_referencia = $${paramIndex++}`;
      params.push(filtros.mes);
    }
    if (filtros.ano) {
      sql += ` AND pf.ano_referencia = $${paramIndex++}`;
      params.push(filtros.ano);
    }

    sql += ' ORDER BY pf.ano_referencia DESC, pf.mes_referencia DESC, f.nome ASC';
    return await queryMany(sql, params);
  }

  async buscarPagamentoPorId(id: string) {
    return await queryOne(
      `SELECT pf.*, f.nome as funcionario_nome, f.cargo
       FROM pagamentos_funcionarios pf
       INNER JOIN funcionarios f ON pf.funcionario_id = f.id
       WHERE pf.id = $1`,
      [id]
    );
  }

  async registrarPagamentoFuncionario(id: string, data?: any) {
    const dataPagamento = new Date().toISOString().split('T')[0];
    const formaPagamento = data?.forma_pagamento || 'TRANSFERENCIA';
    await query(
      "UPDATE pagamentos_funcionarios SET status = 'PAGO', data_pagamento = $1, forma_pagamento = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [dataPagamento, id, formaPagamento]
    );
    return this.buscarPagamentoPorId(id);
  }

  // ==================== DASHBOARD ====================

  async obterDashboard() {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    const totalAlunos = await queryOne('SELECT COUNT(*) as count FROM alunos', []);
    const totalProfessores = await queryOne('SELECT COUNT(*) as count FROM professores p INNER JOIN funcionarios f ON p.funcionario_id = f.id WHERE f.ativo = true', []);
    const totalTurmas = await queryOne('SELECT COUNT(*) as count FROM turmas WHERE ativa = true', []);
    
    const receitaMes = await queryOne(
      `SELECT COALESCE(SUM(valor_pago), 0) as total FROM mensalidades 
       WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento::date) = $1 AND EXTRACT(YEAR FROM data_pagamento::date) = $2`,
      [mesAtual, anoAtual]
    );
    
    const despesasMes = await queryOne(
      `SELECT COALESCE(SUM(valor), 0) as total FROM despesas 
       WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento::date) = $1 AND EXTRACT(YEAR FROM data_pagamento::date) = $2`,
      [mesAtual, anoAtual]
    );
    
    const mensalidadesPendentes = await queryOne(
      `SELECT COUNT(*) as count FROM mensalidades 
       WHERE status NOT IN ('PAGO', 'CANCELADO') 
       AND (
         -- Mês atual (PENDENTE) ou já vencida
         (mes_referencia = $1 AND ano_referencia = $2) OR data_vencimento < CURRENT_DATE
       )`,
      [mesAtual, anoAtual]
    );

    // Total de despesas pendentes (não pagas)
    const despesasPendentes = await queryOne(
      `SELECT COALESCE(SUM(valor), 0) as total FROM despesas 
       WHERE status != 'PAGO' AND status != 'CANCELADO'`,
      []
    );

    // Alunos por turma
    const alunosPorTurma = await queryMany(
      `SELECT t.serie, t.turno, COUNT(a.id) as quantidade 
       FROM turmas t 
       INNER JOIN alunos a ON a.turma_id = t.id 
       WHERE t.ativa = true 
       GROUP BY t.id, t.serie, t.turno 
       HAVING COUNT(a.id) > 0
       ORDER BY t.serie, t.turno`
    );

    // Mensalidades por status (com lógica calculada)
    const mensalidadesPorStatus = await queryMany(
      `SELECT 
         CASE 
           WHEN status = 'PAGO' THEN 'Pago'
           WHEN status = 'CANCELADO' THEN 'Cancelado'
           WHEN status NOT IN ('PAGO', 'CANCELADO') AND data_vencimento < CURRENT_DATE THEN 'Vencida'
           WHEN status NOT IN ('PAGO', 'CANCELADO') AND mes_referencia = $1 AND ano_referencia = $2 THEN 'Pendente'
           ELSE 'Futura'
         END as status,
         COUNT(*) as quantidade
       FROM mensalidades
       GROUP BY 
         CASE 
           WHEN status = 'PAGO' THEN 'Pago'
           WHEN status = 'CANCELADO' THEN 'Cancelado'
           WHEN status NOT IN ('PAGO', 'CANCELADO') AND data_vencimento < CURRENT_DATE THEN 'Vencida'
           WHEN status NOT IN ('PAGO', 'CANCELADO') AND mes_referencia = $1 AND ano_referencia = $2 THEN 'Pendente'
           ELSE 'Futura'
         END`,
      [mesAtual, anoAtual]
    );

    // Histórico receita vs despesa (últimos 6 meses)
    const nomeMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitaVsDespesa = [];
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      const receita = await queryOne(
        `SELECT COALESCE(SUM(valor_pago), 0) as total FROM mensalidades 
         WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento::date) = $1 AND EXTRACT(YEAR FROM data_pagamento::date) = $2`,
        [mes, ano]
      );
      
      const despesa = await queryOne(
        `SELECT COALESCE(SUM(valor), 0) as total FROM despesas 
         WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento::date) = $1 AND EXTRACT(YEAR FROM data_pagamento::date) = $2`,
        [mes, ano]
      );
      
      receitaVsDespesa.push({
        mes: nomeMeses[mes - 1],
        receita: parseFloat(receita?.total || '0'),
        despesa: parseFloat(despesa?.total || '0')
      });
    }

    return {
      totalAlunos: parseInt(totalAlunos?.count || '0'),
      totalProfessores: parseInt(totalProfessores?.count || '0'),
      totalTurmas: parseInt(totalTurmas?.count || '0'),
      mensalidadesPendentes: parseInt(mensalidadesPendentes?.count || '0'),
      receitaMensal: parseFloat(receitaMes?.total || '0'),
      despesaMensal: parseFloat(despesasMes?.total || '0'),
      despesasPendentes: parseFloat(despesasPendentes?.total || '0'),
      alunosPorTurma: alunosPorTurma.map((r: any) => ({ serie: r.serie, turno: r.turno, quantidade: parseInt(r.quantidade) })),
      mensalidadesPorStatus: mensalidadesPorStatus.map((r: any) => ({ status: r.status, quantidade: parseInt(r.quantidade) })),
      receitaVsDespesa,
      inadimplentes: await this.obterInadimplentes()
    };
  }

  async obterInadimplentes() {
    // Busca os 10 maiores devedores (alunos com mensalidades atrasadas)
    const inadimplentes = await queryMany(
      `SELECT 
         a.id as aluno_id,
         a.nome as aluno_nome,
         r.telefone as responsavel_telefone,
         r.nome as responsavel_nome,
         COALESCE(SUM(m.valor - COALESCE(m.desconto, 0) + COALESCE(m.multa, 0) + COALESCE(m.juros, 0)), 0) as total_divida
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       INNER JOIN mensalidades m ON m.aluno_id = a.id
       WHERE m.status NOT IN ('PAGO', 'CANCELADO') 
         AND m.data_vencimento < CURRENT_DATE
       GROUP BY a.id, a.nome, r.telefone, r.nome
       HAVING COALESCE(SUM(m.valor - COALESCE(m.desconto, 0) + COALESCE(m.multa, 0) + COALESCE(m.juros, 0)), 0) > 0
       ORDER BY total_divida DESC
       LIMIT 5`
    );

    return inadimplentes.map((r: any) => ({
      alunoId: r.aluno_id,
      alunoNome: r.aluno_nome,
      responsavelTelefone: r.responsavel_telefone || 'Não informado',
      responsavelNome: r.responsavel_nome || 'Não informado',
      totalDivida: parseFloat(r.total_divida || '0')
    }));
  }

  async obterHistoricoAnual(ano: number) {
    const meses = [];
    for (let mes = 1; mes <= 12; mes++) {
      const receita = await queryOne(
        `SELECT COALESCE(SUM(valor_pago), 0) as total FROM mensalidades 
         WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento) = $1 AND EXTRACT(YEAR FROM data_pagamento) = $2`,
        [mes, ano]
      );
      
      const despesa = await queryOne(
        `SELECT COALESCE(SUM(valor), 0) as total FROM despesas 
         WHERE status = 'PAGO' AND EXTRACT(MONTH FROM data_pagamento) = $1 AND EXTRACT(YEAR FROM data_pagamento) = $2`,
        [mes, ano]
      );

      meses.push({
        mes,
        receita: parseFloat(receita?.total || '0'),
        despesa: parseFloat(despesa?.total || '0'),
        saldo: parseFloat(receita?.total || '0') - parseFloat(despesa?.total || '0')
      });
    }

    return meses;
  }
}

export const financeiroService = new FinanceiroService();
