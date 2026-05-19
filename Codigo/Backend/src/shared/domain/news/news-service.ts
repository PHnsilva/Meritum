export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  imageUrl?: string;
}

export async function fetchAgenciaBrasilNews(): Promise<NewsItem[]> {
  try {
    const apiKey = '7a91258b6d0c4d0fa6b829b6a01b96f2';
    const today = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=university&from=${fromDate}&to=${today}&sortBy=publishedAt&language=pt&pageSize=15&apiKey=${apiKey}`
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json() as { articles?: Array<{ title?: string; description?: string; url?: string; publishedAt?: string; urlToImage?: string }> };

    if (!data.articles || data.articles.length === 0) {
      console.log('[news] Nenhuma notícia encontrada via NewsAPI, usando mock');
      return getMockNews();
    }

    const validArticles = data.articles.filter((article) => article.title && article.title.length > 0);

    const news: NewsItem[] = validArticles.slice(0, 5).map((article, index: number) => ({
      id: `newsapi-${index}-${Date.now()}`,
      title: article.title || '',
      summary: article.description || '',
      link: article.url || 'https://newsapi.org',
      publishedAt: article.publishedAt || new Date().toISOString(),
      imageUrl: article.urlToImage || undefined
    }));

    if (news.length === 0) {
      return getMockNews();
    }

    return news;
  } catch (err) {
    console.error('[news] Erro ao buscar notícias NewsAPI:', err);
    return getMockNews();
  }
}

function getMockNews(): NewsItem[] {
  const mockImages = [
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1427504494785-cdba58dadff6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  ];

  return [
    {
      id: 'mock-1',
      title: 'MEC anuncia novas bolsas de estudo para ensino superior',
      summary: 'Ministério da Educação oferecerá 50 mil novas bolsas em universidades federais durante o ano letivo.',
      link: 'https://agenciabrasil.ebc.com.br/educacao',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      imageUrl: mockImages[0]
    },
    {
      id: 'mock-2',
      title: 'Brasil sobe em ranking mundial de educação',
      summary: 'País avança 12 posições em índice de qualidade educacional global.',
      link: 'https://agenciabrasil.ebc.com.br/educacao',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      imageUrl: mockImages[1]
    },
    {
      id: 'mock-3',
      title: 'Professores recebem aumento salarial historicamente importante',
      summary: 'Reajuste de 8% beneficia 500 mil educadores em todo o país.',
      link: 'https://agenciabrasil.ebc.com.br/educacao',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      imageUrl: mockImages[2]
    },
    {
      id: 'mock-4',
      title: 'Inteligência artificial transformará salas de aula',
      summary: 'Tecnologia será integrada ao currículo escolar de forma pedagógica.',
      link: 'https://agenciabrasil.ebc.com.br/educacao',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      imageUrl: mockImages[3]
    },
    {
      id: 'mock-5',
      title: 'Universidades federais ampliam oferta de cursos online',
      summary: 'Educação a distância cresce 25% em matriculas no ensino superior.',
      link: 'https://agenciabrasil.ebc.com.br/educacao',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      imageUrl: mockImages[0]
    }
  ];
}
