'use client';

import { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isRecording: boolean;
}

const AudioVisualizer = ({ isRecording }: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(2));

  useEffect(() => {
    if (!isRecording) {
      setBars(Array(20).fill(2));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => 
        prev.map(() => isRecording ? Math.random() * 98 + 2 : 2)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-end justify-center gap-1 h-24 my-4">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-2 bg-primary transition-all duration-100 rounded-t"
          initial={{ height: '2%' }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );
};

interface Analysis {
  events: {
    circumstance: string;
    conditions: {
      description: string;
      oneInX: number;
    }[];
  }[];
  finalOneInX: number;
  summary: string;
}

interface AnalysisDisplayProps {
  analysis: Analysis;
  className?: string;
}

function formatOneInX(x: number): string {
  if (x >= 1_000_000_000) {
    return `1 in ${(x / 1_000_000_000).toFixed(1)} billion`;
  }
  if (x >= 1_000_000) {
    return `1 in ${(x / 1_000_000).toFixed(1)} million`;
  }
  if (x >= 1_000) {
    return `1 in ${(x / 1_000).toFixed(1)}k`;
  }
  return `1 in ${Math.round(x)}`;
}

function AnalysisDisplay({ analysis, className = '' }: AnalysisDisplayProps) {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center space-y-4">
        <div className="inline-block">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-primary/5 rounded-lg p-6 backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold mb-3">The Improbability Factor</h3>
            <p className="text-4xl font-bold text-primary mb-2">
              {formatOneInX(analysis.finalOneInX)}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {analysis.summary}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6">
        {analysis.events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`rounded-lg transition-colors cursor-pointer ${
                selectedEvent === index
                  ? 'bg-primary/10 shadow-lg'
                  : 'bg-muted/50 hover:bg-primary/5'
              }`}
              onClick={() => setSelectedEvent(selectedEvent === index ? null : index)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-lg mb-1">{event.circumstance}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Combined probability: {formatOneInX(
                        event.conditions.reduce((acc, curr) => acc * curr.oneInX, 1)
                      )}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedEvent === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </motion.div>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: selectedEvent === index ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    {event.conditions.map((condition, condIndex) => (
                      <div
                        key={condIndex}
                        className="bg-background rounded p-3 flex items-center justify-between text-sm"
                      >
                        <span className="flex-1 mr-4">{condition.description}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (1 / condition.oneInX) * 100)}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full bg-primary"
                            />
                          </div>
                          <span className="font-mono whitespace-nowrap">
                            {formatOneInX(condition.oneInX)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-6">
        <p>Click on each event to see the detailed breakdown of probabilities</p>
      </div>
    </div>
  );
}

export function VoiceRecorder() {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: "audio/webm" }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'recording') {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setAnalysis(null);
    setError(null);
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleRestart = () => {
    clearBlobUrl();
    setRecordingDuration(0);
    setAnalysis(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!mediaBlobUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert audio URL to base64
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Send to our API
      const result = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioData: base64 }),
      });

      if (!result.ok) {
        throw new Error('Failed to analyze audio');
      }

      const data = await result.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <AudioVisualizer isRecording={status === 'recording'} />

      <div className="flex justify-center items-center gap-4 flex-wrap">
        {status === 'idle' && (
          <button
            onClick={handleStartRecording}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
            Start Recording
          </button>
        )}

        {status === 'recording' && (
          <button
            onClick={handleStopRecording}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="16" x="4" y="4"/>
            </svg>
            Stop Recording
          </button>
        )}

        {status === 'stopped' && (
          <>
            <button
              onClick={() => window.open(mediaBlobUrl)}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Recording
            </button>
            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 16h5v5"/>
              </svg>
              Record Again
            </button>
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Analyze Story
            </button>
          </>
        )}
      </div>

      {status === 'recording' && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Recording: {formatDuration(recordingDuration)}
        </div>
      )}

      {isAnalyzing && (
        <div className="mt-6">
          <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: '33%' }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Analyzing your story...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {analysis && (
        <AnalysisDisplay analysis={analysis} className="mt-16" />
      )}
    </div>
  );
} 