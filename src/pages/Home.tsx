import PostCard from '@/components/PostCard';
import { useFeed } from '@/hooks/useFeed';

export default function Home() {
  const { posts, loading } = useFeed();
  return <div className='space-y-4'>{loading ? 'Loading...' : posts.map((p) => <PostCard key={p.id} {...p} />)}</div>;
}
