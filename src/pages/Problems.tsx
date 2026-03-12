import { useState } from 'react';
import { useProblems } from '@/hooks/useProblems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Problems() {
  const { problems, createProblem, loading } = useProblems();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Problems</h1>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Title' />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Describe the problem' />
      <Button onClick={() => createProblem(title, description)}>Submit</Button>
      {loading ? 'Loading...' : problems.map((p) => <div key={p.id}>{p.title}</div>)}
    </div>
  );
}
