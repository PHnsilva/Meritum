type AlertProps = {
  children: string;
  tone?: 'error' | 'success' | 'info';
};

export function Alert({ children, tone = 'info' }: AlertProps) {
  return <div className={`alert alert--${tone}`}>{children}</div>;
}
