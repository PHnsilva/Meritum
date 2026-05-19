export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  imageUrl?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export async function fetchEducationNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/noticias/educacao`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (err) {
    console.error('Erro ao buscar notícias:', err);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Há poucos minutos';
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString('pt-BR');
}
