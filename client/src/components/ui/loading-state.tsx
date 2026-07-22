import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

export default function LoadingState({ className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-5', className)}>
      <Loader className="animate-spin" />
      <p>Loading...</p>
    </div>
  );
}
