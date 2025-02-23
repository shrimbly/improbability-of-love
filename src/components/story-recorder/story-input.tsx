'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const VoiceRecorder = dynamic(() => import('./voice-recorder').then(mod => mod.VoiceRecorder), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

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

function TextInput() {
  const [story, setStory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!story.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: story }),
      });

      if (!result.ok) {
        throw new Error('Failed to analyze story');
      }

      const data = await result.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Write your love story here..."
        value={story}
        onChange={(e) => setStory(e.target.value)}
        className="min-h-[200px]"
      />

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={!story.trim() || isAnalyzing}
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Story'}
        </button>
      </div>

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

export function StoryInput() {
  return (
    <div className="p-6 max-w-xl mx-auto bg-card rounded-lg border shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tell Your Story</h2>
        <p className="text-muted-foreground">
          Share how you met your partner, and we&apos;ll calculate the incredible odds of your paths crossing.
        </p>
      </div>

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice">Record Voice</TabsTrigger>
          <TabsTrigger value="text">Write Story</TabsTrigger>
        </TabsList>
        <TabsContent value="voice">
          <VoiceRecorder />
        </TabsContent>
        <TabsContent value="text">
          <TextInput />
        </TabsContent>
      </Tabs>
    </div>
  );
} 