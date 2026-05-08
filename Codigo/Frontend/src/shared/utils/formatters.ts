export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCnpj(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatRg(value: string) {
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
  const statePrefix = cleanValue.match(/^[A-Z]{1,2}/)?.[0] ?? '';
  const digits = cleanValue.slice(statePrefix.length).replace(/\D/g, '').slice(0, 8);

  if (statePrefix) {
    const formattedDigits = digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');

    return [statePrefix, formattedDigits].filter(Boolean).join('-');
  }

  return digits
    .slice(0, 9)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
}
