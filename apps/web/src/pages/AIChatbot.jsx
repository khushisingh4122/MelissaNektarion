import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Send, Bot, User, Volume2, Square } from 'lucide-react';
import { useChatMessages } from '../hooks/useChatMessages.js';
import { chatMessages } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';
import VoiceInputButton from "../components/VoiceInputButton.jsx";

const AIChatbot = () => {
  const { t, language } = useTranslation();
  const { messages, addMessage, isTyping } = useChatMessages(chatMessages);
  const [inputValue, setInputValue] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputValue.trim()) {
      addMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (text) => {
    setInputValue(text);
  };

  // ✅ FIXED: removed apiServerClient
  const playAudio = () => {
    console.log("TTS coming soon");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.aiChatbot')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            {t('chatbot.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('chatbot.subtitle')}
          </p>
        </div>

        <Card className="h-[calc(100vh-16rem)]">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {t('chatbot.assistant')}
              </div>
              <VoiceInputButton 
                onTranscript={handleVoiceTranscript} 
                language={language === 'hi' ? 'hi-IN' : 'en-IN'} 
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] p-3 rounded-xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>

                    {message.sender === 'ai' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playAudio()}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
              />
              <Button onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIChatbot;