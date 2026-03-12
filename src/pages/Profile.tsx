import { useAuth } from '@/hooks/useAuth';
export default function Profile() { const { profile } = useAuth(); return <div>{profile ? profile.full_name : 'Profile'}</div>; }
