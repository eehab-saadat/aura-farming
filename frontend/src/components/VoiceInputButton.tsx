import React from "react";
import { useVoiceInput } from "../hooks/useVoiceInput";

interface VoiceInputButtonProps {
  onTranscriptComplete: (text: string) => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptComplete,
}) => {
  const {
    transcript,
    isListening,
    error,
    supported,
    startListening,
    stopListening,
  } = useVoiceInput();

  const handleClick = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscriptComplete(transcript.trim());
      }
    } else {
      startListening();
    }
  };

  if (!supported) {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <p className="text-sm text-gray-500">Voice input not supported</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Input Button */}
      <button
        onClick={handleClick}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
          isListening
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse"
            : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-300"
        }`}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
      >
        <span className="text-3xl text-white">{isListening ? "⏹️" : "🎤"}</span>
      </button>

      {/* Status and Transcript */}
      <div className="text-center min-h-[60px] flex flex-col justify-center">
        <p
          className={`text-sm font-medium mb-2 ${
            isListening ? "text-red-600" : "text-gray-600"
          }`}
        >
          {isListening ? "Listening..." : "Click to start voice input"}
        </p>

        {transcript && (
          <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-gray-900 break-words">{transcript}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center">
          <p className="text-xs text-red-600 max-w-xs break-words">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;
