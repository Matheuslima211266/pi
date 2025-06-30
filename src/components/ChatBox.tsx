import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send } from 'lucide-react';

const ChatBox = ({ messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Card className="p-4 bg-card/70 border-primary h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">Chat</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto mb-3 space-y-1">
        {messages.map(msg => (
          <div key={msg.id} className="text-sm">
            <Badge variant="secondary" className="text-xs mr-2">
              {msg.player}
            </Badge>
            <span className="text-muted-foreground">{msg.message}</span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-input border-border text-foreground"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} size="sm">
          <Send size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default ChatBox;
