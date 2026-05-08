import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { InstituicaoForm } from '../components/InstituicaoForm';
import { createInstituicao } from '../services/instituicaoService';
import type { CreateInstituicaoInput } from '../types/instituicao';

export function InstituicaoCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateInstituicaoInput) {
    await createInstituicao(input);
    navigate('/instituicoes');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Nova instituicao"
        description="Cadastre uma instituicao de ensino para que alunos possam seleciona-la no cadastro."
        actions={
          <Link className="button button--secondary" to="/instituicoes">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        <InstituicaoForm submitLabel="Salvar instituicao" onSubmit={handleSubmit} />
      </section>
    </section>
  );
}
