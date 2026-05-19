import { useEffect, useState } from 'react';
import type { NewsItem } from '../services/newsService';
import { fetchEducationNews } from '../services/newsService';
import { NewsCard } from './NewsCard';

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNews() {
      try {
        const articles = await fetchEducationNews();
        setNews(articles);
      } catch (err) {
        setError('Nao foi possivel carregar as noticias');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  if (loading) {
    return <div className="news-feed__loading">Carregando noticias...</div>;
  }

  if (error) {
    return <div className="news-feed__error">{error}</div>;
  }

  if (news.length === 0) {
    return <div className="news-feed__empty">Nenhuma noticia no momento</div>;
  }

  const featuredNews = news[0];
  const otherNews = news.slice(1, 4);

  return (
    <section className="news-feed">
      <h2>Jornal do Aluno</h2>

      {/* Featured Article */}
      <article className="news-featured">
        <div className="news-featured__image-container">
          <img
            src={featuredNews.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
            alt={featuredNews.title}
            className="news-featured__image"
          />
        </div>
        <div className="news-featured__content">
          <span className="news-featured__category">Educação</span>
          <h3 className="news-featured__title">{featuredNews.title}</h3>
          <p className="news-featured__summary">{featuredNews.summary || 'Confira as ultimas noticias sobre educacao e oportunidades nas universidades.'}</p>
          <a href={featuredNews.link} target="_blank" rel="noopener noreferrer" className="news-featured__link">
            Ler artigo completo →
          </a>
        </div>
      </article>

      {/* News Grid */}
      {otherNews.length > 0 && (
        <div className="news-grid">
          {otherNews.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </section>
  );
}
