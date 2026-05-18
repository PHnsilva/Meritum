import { ArrowLeft, Building2, CheckCircle, School } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { ParceiroForm } from '../components/ParceiroForm';
import { registerParceiro } from '../services/parceiroService';
import type { CreateParceiroInput, UpdateParceiroInput } from '../types/parceiro';

export function CadastroParceiroPage() {
  const [success, setSuccess] = useState(false);

  async function handleSubmit(input: CreateParceiroInput | UpdateParceiroInput) {
    await registerParceiro(input as CreateParceiroInput);
    setSuccess(true);
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="Meritum">
        <div className="login-hero__brand">
          <School size={42} />
          <div>
            <strong>Meritum</strong>
            <span>Sistema de reconhecimento academico</span>
          </div>
        </div>
        <div className="login-hero__panel">
          <span>PUC Minas</span>
          <strong>Ofereca vantagens e faca parte do ecossistema de merito estudantil.</strong>
        </div>
      </section>

      <section className="login-card" style={{ overflowY: 'auto', maxHeight: '100dvh' }}>
        <div className="login-card__tools">
          <ThemeToggle />
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0', textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: 'var(--color-success, #16a34a)' }} />
            <h1 style={{ margin: 0 }}>Solicitacao enviada!</h1>
            <p style={{ color: 'var(--color-text-muted, #64748b)', maxWidth: '340px' }}>
              Seu cadastro foi recebido e esta aguardando a aprovacao da administracao.
              Voce sera notificado por email quando sua conta for ativada.
            </p>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <ArrowLeft size={14} />
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <div className="login-card__header">
              <p className="eyebrow">
                <Building2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Empresa parceira
              </p>
              <h1>Solicitar cadastro</h1>
              <span>Preencha os dados da sua empresa. Apos a analise, voce recebera um email confirmando a aprovacao do cadastro.</span>
            </div>

            <ParceiroForm
              submitLabel="Enviar solicitacao"
              onSubmit={handleSubmit}
            />

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <ArrowLeft size={14} />
                Voltar ao login
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
