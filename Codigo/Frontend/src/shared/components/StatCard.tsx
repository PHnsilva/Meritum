import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: 'blue' | 'gray' | 'green';
};

export function StatCard({ label, value, icon, tone = 'blue' }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
