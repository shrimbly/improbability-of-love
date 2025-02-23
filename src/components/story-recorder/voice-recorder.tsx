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

function AnalysisDisplay({ analysis, className = '' }: AnalysisDisplayProps) {
  const formatProbability = (prob: number): string => {
    if (prob < 0.0001) {
      return prob.toExponential(2);
    }
    return (prob * 100).toFixed(2) + '%';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Analysis Complete</h3>
        <p className="text-muted-foreground">{analysis.summary}</p>
        <p className="text-2xl font-bold mt-4">
          Probability: {formatProbability(analysis.finalOneInX)}
        </p>
      </div>

      <div className="space-y-4">
        {analysis.events.map((event, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">{event.circumstance}</h4>
            <ul className="space-y-2">
              {event.conditions.map((condition, condIndex) => (
                <li key={condIndex} className="flex items-center justify-between text-sm">
                  <span>{condition.description}</span>
                  <span className="font-mono">{formatProbability(condition.oneInX)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
        <AnalysisDisplay analysis={analysis} className="mt-8" />
      )}
    </div>
  );
} 