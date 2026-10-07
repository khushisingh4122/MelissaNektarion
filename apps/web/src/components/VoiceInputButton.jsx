import React, { useState, useRef } from "react";
import { Mic, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "../i18n/useTranslation.jsx";
import { apiServerClient } from "../lib/apiServerClient.js";
import { convertToWAV } from "../utils/audioConverter.js";


const VoiceInputButton = ({ onTranscript, language = "hi-IN", className = "" }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState("idle"); // idle, listening, processing, success, error
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus("listening");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus("processing");
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      setStatus("processing");
      
      // Convert WebM/OGG to WAV format
      const wavBlob = await convertToWAV(audioBlob);
      
      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("language", language);

      const response = await apiServerClient.fetch('/speech-to-text', {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      if (data.text) {
        onTranscript(data.text);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Speech to text error:", error);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleClick = () => {
    if (status === "idle" || status === "error" || status === "success") {
      startRecording();
    } else if (status === "listening") {
      stopRecording();
    }
  };

  const getButtonStyles = () => {
    switch (status) {
      case "listening": return "bg-red-500 hover:bg-red-600 text-white animate-pulse-ring";
      case "processing": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "success": return "bg-green-500 hover:bg-green-600 text-white";
      case "error": return "bg-destructive hover:bg-destructive/90 text-white";
      default: return "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "processing": return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success": return <CheckCircle2 className="w-4 h-4" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return <Mic className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        type="button"
        size="icon"
        onClick={handleClick}
        className={`rounded-full transition-all duration-300 ${getButtonStyles()}`}
        disabled={status === 'processing'}
      >
        {getIcon()}
      </Button>
      <span className="text-sm text-muted-foreground font-medium">
        {t(`voice.${status}`)}
      </span>
    </div>
  );
};

export default VoiceInputButton;