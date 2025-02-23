import { StoryInput } from '@/components/story-recorder/story-input';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">The Improbability of Love</h1>
        <p className="text-lg text-center text-muted-foreground mb-12">
          Tell us your love story, and we&apos;ll calculate the incredible odds of your paths crossing.
        </p>
        <StoryInput />
      </div>
    </main>
  );
}
