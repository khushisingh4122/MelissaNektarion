import { useState } from 'react';

export const useChatMessages = (initialMessages) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    if (sender === 'user') {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse = generateAIResponse(text);
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'ai',
          text: aiResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
      return 'Based on current forecasts, we expect heavy rainfall (80mm+) in the next 24 hours. I recommend securing equipment and ensuring proper drainage. Temperature will be around 28°C with 67% humidity.';
    }
    
    if (lowerMessage.includes('crop') || lowerMessage.includes('health')) {
      return 'Your crop health score is 87.3%. The North and South fields are performing well, but the East Field shows some stress with leaf blight affecting 4.2% of the area. I recommend fungicide treatment within 48 hours.';
    }
    
    if (lowerMessage.includes('drone') || lowerMessage.includes('monitoring')) {
      return 'The drone is currently active with 78% battery, covering the East Field at 45m altitude. Mission progress is at 67% with 142.8 hectares covered so far. All systems operating normally.';
    }
    
    if (lowerMessage.includes('pest') || lowerMessage.includes('disease')) {
      return 'Current pest alerts: Aphids detected in North Field (critical), Whiteflies in East Field (moderate). Disease detection shows Leaf Blight (medium severity, 4.2% area) and Powdery Mildew (high severity, 6.8% area). Immediate treatment recommended for high-severity areas.';
    }
    
    if (lowerMessage.includes('yield') || lowerMessage.includes('prediction')) {
      return 'Based on current conditions, I predict a yield of 4.7 tons per hectare with 87% confidence. This is a 6.8% improvement over last year. Key factors: favorable weather (32% impact), optimal soil moisture (28% impact), and good crop health (25% impact).';
    }
    
    return 'I can help you with crop health analysis, weather forecasts, pest alerts, drone monitoring, yield predictions, and government schemes. What would you like to know more about?';
  };

  return { messages, addMessage, isTyping };
};