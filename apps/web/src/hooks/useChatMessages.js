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

    if (lowerMessage.includes('how does') || lowerMessage.includes('what is melissa') || lowerMessage.includes('project')) {
      return 'MelissaNektarion connects farm data, crop-health analysis, mission planning, and drone monitoring in one dashboard. The web app sends requests to the FastAPI backend, while Pixhawk and Raspberry Pi hardware provide telemetry and field data when connected.';
    }

    if (lowerMessage.includes('mission') || lowerMessage.includes('waypoint') || lowerMessage.includes('flight plan')) {
      return 'To plan a mission: open Mission Planning, choose the mission type and drone, select the crop and field, set altitude and speed, then add at least two waypoints on the map. Save and validate the route. The current app prepares and validates missions; real Pixhawk dispatch should only happen after hardware connection and pre-flight checks are confirmed.';
    }

    if (lowerMessage.includes('pixhawk') || lowerMessage.includes('raspberry') || lowerMessage.includes('hardware')) {
      return 'Connect the Pixhawk by USB or telemetry radio, open Drone Monitoring, enter its serial port such as COM3 or /dev/ttyUSB0, and wait for a heartbeat. The page can read GPS, battery, altitude, flight mode, and armed status. Raspberry Pi can act as the field computer for sensors, camera, and a telemetry link; never arm or fly until the vehicle and area are checked safely.';
    }

    if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
      return 'Before planning a flight, check rain, wind speed, visibility, temperature, and lightning risk. Avoid flying during rain, thunderstorms, poor visibility, or strong gusts. For field work, rainfall can change irrigation and spraying decisions, so confirm the local forecast before acting. This assistant currently provides guidance, not a live weather forecast.';
    }
    
    if (lowerMessage.includes('crop') || lowerMessage.includes('health')) {
      return 'Your crop health score is 87.3%. The North and South fields are performing well, but the East Field shows some stress with leaf blight affecting 4.2% of the area. I recommend fungicide treatment within 48 hours.';
    }
    
    if (lowerMessage.includes('drone') || lowerMessage.includes('monitoring')) {
      return 'The drone is currently active with 78% battery, covering the East Field at 45m altitude. Mission progress is at 67% with 142.8 hectares covered so far. All systems operating normally.';
    }
    
    if (lowerMessage.includes('pest') || lowerMessage.includes('disease')) {
      return 'Open Crop Health Analysis and upload a clear JPEG, PNG, or WebP image. The disease model returns a possible disease, confidence, and suggested next step when a trained model is configured. Treat the result as guidance: confirm serious disease with a local agronomist before applying chemicals.';
    }

    if (lowerMessage.includes('sensor') || lowerMessage.includes('soil') || lowerMessage.includes('irrigation')) {
      return 'Use field sensor readings to compare soil moisture, temperature, humidity, and light across zones. Irrigate based on the crop, soil, growth stage, and local weather rather than one reading alone. The hardware integration can be extended to send Raspberry Pi sensor readings to the backend.';
    }
    
    if (lowerMessage.includes('yield') || lowerMessage.includes('prediction')) {
      return 'Based on current conditions, I predict a yield of 4.7 tons per hectare with 87% confidence. This is a 6.8% improvement over last year. Key factors: favorable weather (32% impact), optimal soil moisture (28% impact), and good crop health (25% impact).';
    }
    
    return 'I can help with mission setup, waypoint planning, weather safety, Pixhawk and Raspberry Pi hardware, drone telemetry, crop-health image analysis, pests, irrigation, yield, and farmer support. Ask: “How do I create a mission?” or “Is it safe to fly in rain?”';
  };

  return { messages, addMessage, isTyping };
};