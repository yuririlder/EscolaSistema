import { Funcionario, FuncionarioProps } from './Funcionario';

export interface ProfessorProps extends FuncionarioProps {
  professorId?: string;
  funcionarioId?: string;
  formacao?: string;
  especialidade?: string;
}

export class Professor extends Funcionario {
  private professorProps: {
    professorId?: string;
    funcionarioId?: string;
    formacao?: string;
    especialidade?: string;
  };

  constructor(props: ProfessorProps) {
    super({ ...props, cargo: props.cargo || 'Professor' });
    this.professorProps = {
      professorId: props.professorId,
      funcionarioId: props.funcionarioId,
      formacao: props.formacao,
      especialidade: props.especialidade,
    };
  }

  get professorId(): string | undefined {
    return this.professorProps.professorId;
  }

  get funcionarioId(): string | undefined {
    return this.professorProps.funcionarioId;
  }

  get formacao(): string | undefined {
    return this.professorProps.formacao;
  }

  get especialidade(): string | undefined {
    return this.professorProps.especialidade;
  }

  toJSON(): ProfessorProps {
    return {
      ...super.toJSON(),
      ...this.professorProps,
    };
  }
}
