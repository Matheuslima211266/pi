
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
    <Card className="p-4 bg-slate-800/70 border-blue-400 h-64">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold">Action Log</h3>
      </div>
      
      <div className="h-48 overflow-y-auto space-y-1">
        {actions.slice(-20).reverse().map(action => (
          <div key={action.id} className="text-sm p-2 bg-gray-800/50 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {action.player}
              </Badge>
              <span className="text-xs text-gray-400">{action.timestamp}</span>
            </div>
            <div className="text-gray-300">{action.action}</div>
          </div>
        ))}
        
        {actions.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Nessuna azione registrata
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionLog;
