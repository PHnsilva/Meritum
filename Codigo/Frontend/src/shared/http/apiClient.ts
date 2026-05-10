const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {

  const hasBody = options.body !== undefined;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',

    headers: hasBody
      ? {
          'Content-Type': 'application/json'
        }
      : undefined,

    body: hasBody
      ? JSON.stringify(options.body)
      : undefined
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Nao foi possivel concluir a operacao',
      response.status
    );
  }

  return data as T;
}