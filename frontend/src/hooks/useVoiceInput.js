import { useState } from "react";
export function useVoiceInput(onTranscript) {
  const [listening, setListening] = useState(false);
  function start() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) throw new Error("Voice input is not available in this browser.");
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => onTranscript(event.results[0][0].transcript);
    recognition.start();
  }
  return { listening, start };
}
