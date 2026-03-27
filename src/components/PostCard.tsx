import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Post = { id: string; title?: string | null; content: string; created_at?: string };

export default function PostCard(post: Post) {
  return (
    <Card>
      <CardHeader><CardTitle>{post.title || 'Untitled post'}</CardTitle></CardHeader>
      <CardContent>
        <p>{post.content}</p>
        {post.created_at && <p className='text-xs text-muted-foreground mt-2'>{new Date(post.created_at).toLocaleString()}</p>}
      </CardContent>
    </Card>
  );
}
