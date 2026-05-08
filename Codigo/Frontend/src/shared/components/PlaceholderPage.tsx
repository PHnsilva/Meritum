import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="stack">
      <PageHeader
        title={title}
        description="Modulo reservado para a proxima etapa do fluxo de moedas, vantagens e resgates."
      />
      <div className="empty-state">
        <Construction size={34} />
        <strong>Modulo em construcao</strong>
        <span>A estrutura de navegacao ja esta pronta para receber as proximas funcionalidades.</span>
      </div>
    </section>
  );
}
