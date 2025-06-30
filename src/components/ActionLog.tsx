import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';

interface ActionLogProps {
  actions: Array<{
    id: number;
    player: string;
    action: string;
    timestamp: string;
  }>;
}

const ActionLog = ({ actions }: ActionLogProps) => {
  return (
    <Card className="p-4 bg-card/70 border-primary h-64">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">Action Log</h3>
      </div>
      
      <div className="h-48 overflow-y-auto space-y-1">
        {actions.slice(-20).reverse().map(action => (
          <div key={action.id} className="text-sm p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {action.player}
              </Badge>
              <span className="text-xs text-muted-foreground">{action.timestamp}</span>
            </div>
            <div className="text-foreground">{action.action}</div>
          </div>
        ))}
        
        {actions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No actions recorded
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionLog;
