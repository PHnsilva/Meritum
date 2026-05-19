import type { NewsItem } from '../services/newsService';
import { formatDate } from '../services/newsService';

interface NewsCardProps {
  news: NewsItem;
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1427504494785-cdba58dadff6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
];

export function NewsCard({ news }: NewsCardProps) {
  const imageIndex = news.id.charCodeAt(news.id.length - 1) % placeholderImages.length;
  const imageUrl = news.imageUrl || placeholderImages[imageIndex];

  return (
    <article className="news-card">
      <img src={imageUrl} alt={news.title} className="news-card__image" />
      <div className="news-card__content">
        <span className="news-card__category">Educação</span>
        <h3 className="news-card__title">{news.title}</h3>
        <time className="news-card__date">{formatDate(news.publishedAt)}</time>
        <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-card__link">
          Ler mais →
        </a>
      </div>
    </article>
  );
}
