/**
 * EmptyState component
 * Displays context-aware empty state messages with optional actions
 */

import { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
