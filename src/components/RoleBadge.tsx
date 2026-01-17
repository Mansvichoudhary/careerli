import { GraduationCap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: 'student' | 'mentor';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RoleBadge = ({ role, size = 'sm', className }: RoleBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (role === 'mentor') {
    return (
      <span className={cn(
        'inline-flex items-center rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        sizeClasses[size],
        className
      )}>
        <Award className={iconSizes[size]} />
        Mentor
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium bg-primary-soft text-primary',
      sizeClasses[size],
      className
    )}>
      <GraduationCap className={iconSizes[size]} />
      Student
    </span>
  );
};

export default RoleBadge;
