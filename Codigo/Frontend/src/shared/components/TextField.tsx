import type { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? label;

  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <input id={fieldId} {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
