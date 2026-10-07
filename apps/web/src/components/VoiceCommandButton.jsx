import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2 } from 'lucide-react';
import { Button } from "../components/ui/button";
import { useTranslation } from "../i18n/useTranslation.jsx";
import { toast } from 'sonner';


const VoiceCommandButton = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info(t('voice.listening'));
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error(t('voice.error'));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCommand = (command) => {
    toast.success(`${t('voice.recognized')}: "${command}"`);
    
    if (command.includes('profile') || command.includes('प्रोफाइल')) {
      navigate('/profile');
    } else if (command.includes('settings') || command.includes('सेटिंग्स')) {
      navigate('/settings');
    } else if (command.includes('support') || command.includes('help') || command.includes('सहायता') || command.includes('मदद')) {
      navigate('/farmer-support');
    } else if (command.includes('pest') || command.includes('कीट')) {
      navigate('/farmer-support');
    } else if (command.includes('language') || command.includes('भाषा')) {
      navigate('/settings');
    } else if (command.includes('theme') || command.includes('थीम')) {
      navigate('/settings');
    } else if (command.includes('notification') || command.includes('अधिसूचना')) {
      navigate('/settings');
    } else {
      toast.error(t('voice.notRecognized'));
    }
  };

  return (
    <Button
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={startListening}
      className={`gap-2 transition-all duration-300 ${isListening ? 'animate-pulse' : ''}`}
    >
      {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
      <span className="hidden sm:inline">{t('voice.commands')}</span>
    </Button>
  );
};

export default VoiceCommandButton;