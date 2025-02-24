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
    <div className={`space-y-12 ${className}`}>
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent -z-10 rounded-3xl blur-xl" />
        <div className="inline-block relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 backdrop-blur-sm border border-primary/10 shadow-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                The Improbability Factor
              </h3>
              <div className="relative">
                <p className="text-5xl font-bold text-primary mb-4 font-display tracking-tight">
                  {formatOneInX(analysis.finalOneInX)}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full mx-auto max-w-[200px]"
                />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-4 leading-relaxed">
                {analysis.summary}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10 rounded-3xl blur-3xl" />
        {analysis.events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.15 }}
          >
            <div
              className={`rounded-xl transition-all duration-300 cursor-pointer ${
                selectedEvent === index
                  ? 'bg-gradient-to-r from-primary/15 to-primary/5 shadow-lg border border-primary/10'
                  : 'bg-card hover:bg-primary/5 border border-border'
              }`}
              onClick={() => setSelectedEvent(selectedEvent === index ? null : index)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-lg mb-2">{event.circumstance}</h4>
                    <p className="text-sm text-muted-foreground">
                      Combined odds: {formatOneInX(
                        event.conditions.reduce((acc, curr) => acc * curr.oneInX, 1)
                      )}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedEvent === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary/70"
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
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </motion.div>
                </div>

                <motion.div
                  initial={false}
                  animate={{ 
                    height: selectedEvent === index ? 'auto' : 0,
                    opacity: selectedEvent === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    {event.conditions.map((condition, condIndex) => (
                      <motion.div
                        key={condIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: condIndex * 0.1 }}
                        className="bg-background/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between text-sm border border-border/50"
                      >
                        <span className="flex-1 mr-6">{condition.description}</span>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (1 / condition.oneInX) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-primary to-primary/70"
                            />
                          </div>
                          <span className="font-mono whitespace-nowrap text-primary">
                            {formatOneInX(condition.oneInX)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p className="inline-block px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10">
          Click on each event to explore the detailed probability breakdown
        </p>
      </motion.div>
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
        <AnalysisDisplay analysis={analysis} className="mt-16" />
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