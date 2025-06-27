
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
    <Card className="h-48 bg-slate-800/50 border border-slate-600">
      <div className="p-2 border-b border-slate-600">
        <h3 className="text-white text-sm font-semibold">Action History</h3>
      </div>
      <ScrollArea className="h-36 p-2">
        <div className="space-y-1">
          {actions.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-4">
              No actions yet...
            </p>
          ) : (
            actions.slice().reverse().map((action) => (
              <div
                key={action.id}
                className="text-xs p-2 bg-slate-700/30 rounded border border-slate-600/50"
              >
                <div className="flex justify-between items-start">
                  <span className="text-blue-400 font-medium">
                    {action.player}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {action.timestamp}
                  </span>
                </div>
                <div className="text-gray-300 mt-1">
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
