/**
 * EmptyState component shown when there are no tasks
 */

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M9 11H3v2h6v-2zm0 4H3v2h6v-2zm0-8H3v2h6V7zm6-4H6C3.79 3 2 4.79 2 7v10c0 2.21 1.79 4 4 4h11c2.21 0 4-1.79 4-4v-9L15 3z" />
            <line x1="14" x2="20" y1="2" y2="8" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No tasks yet</h3>
        <p className="text-sm text-muted-foreground">
          Create one to get started!
        </p>
      </CardContent>
    </Card>
  );
}
