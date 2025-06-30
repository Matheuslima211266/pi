import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send } from 'lucide-react';

interface ChatAreaProps {
  messages: Array<{
    id: number;
    player: string;
    message: string;
    timestamp: string;
  }>;
  onSendMessage: (message: string) => void;
}

const ChatArea = ({ messages = [], onSendMessage }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Card className="sidebar-section bg-card/70 border-border p-3 flex flex-col min-h-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="text-primary" size={16} />
        <h3 className="text-foreground text-sm font-semibold">Chat</h3>
      </div>
      
      <div className="flex-1 bg-input/50 rounded p-2 mb-3 overflow-y-auto max-h-[120px] min-h-[100px]">
        <div className="space-y-1">
          {messages.slice(-10).map(msg => (
            <div key={msg.id} className="text-xs">
              <Badge variant="secondary" className="text-xs mr-1">
                {msg.player}
              </Badge>
              <span className="text-muted-foreground">{msg.message}</span>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-xs py-4">
              No messages yet
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
          className="bg-input border-border text-foreground text-xs h-7"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} size="sm" className="h-7 px-2">
          <Send size={12} />
        </Button>
      </div>
    </Card>
  );
};

export default ChatArea;
