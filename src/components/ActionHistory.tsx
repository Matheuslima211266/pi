import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface ActionHistoryProps {
  actions: Array<{
    id: number | string;
    player: string;
    action: string;
    timestamp: string;
  }>;
}

const ActionHistory = ({ actions }: ActionHistoryProps) => {
  return (
    <Card className="h-full bg-card/50 border border-border flex flex-col">
      <div className="p-2 border-b border-border">
        <h3 className="text-foreground text-sm font-semibold">Action History</h3>
      </div>
      <ScrollArea className="flex-grow p-2">
        <div className="space-y-1">
          {actions.length === 0 ? (
            <p className="text-muted-foreground text-xs text-center py-4">
              No actions yet...
            </p>
          ) : (
            actions.slice().reverse().map((action) => (
              <div
                key={action.id}
                className="text-xs p-2 bg-muted/30 rounded border border-border/50"
              >
                <div className="flex justify-between items-start">
                  <span className="text-primary font-medium">
                    {action.player}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {action.timestamp}
                  </span>
                </div>
                <div className="text-foreground mt-1">
                  {action.action}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ActionHistory;
