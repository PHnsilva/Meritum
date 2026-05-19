import { getStoredUser } from '../../auth/services/authService';
import { NewsFeed } from '../../news/components/NewsFeed';

export function StudentDashboardPage() {
  getStoredUser();

  return (
    <section className="stack">
      <NewsFeed />
    </section>
  );
}
