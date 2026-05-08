import type { SelectHTMLAttributes } from 'react';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  placeholder?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

export function SelectField({ label, hint, id, placeholder = 'Selecione', options, ...props }: SelectFieldProps) {
  const fieldId = id ?? props.name ?? label;

  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <select id={fieldId} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
