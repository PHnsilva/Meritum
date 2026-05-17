export function isValidCpf(raw: string): boolean {
  return raw.replace(/\D/g, '').length === 11;
}

export function isValidCnpj(raw: string): boolean {
  return raw.replace(/\D/g, '').length === 14;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 6;
}

export function assertValid(condition: boolean, message: string): void {
  if (!condition) {
    const err = new Error(message);
    err.name = 'ValidationError';
    throw err;
  }
}
