'use client';

import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { getRoadmap } from '@/app/actions';
import { RoadmapForm, type RoadmapFormValues } from '@/components/roadmap/roadmap-form';
import { RoadmapDisplay } from '@/components/roadmap/roadmap-display';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { UserProfile } from '@/components/auth/user-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleGenerate = async (data: RoadmapFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You need to be logged in to generate a roadmap.',
      });
      return;
    }
    setIsLoading(true);
    setRoadmap(null);
    try {
      const result = await getRoadmap(data.goal);
      if (result.error) {
        throw new Error(result.error);
      }
      setRoadmap(result.roadmap);
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Roadmap',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <header className="flex justify-between items-center mb-12">
        <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary mb-4">
              Career Compass AI
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl">
              A career roadmap is your strategic guide to professional growth. Describe your ambition, and let our AI chart a personalized path for you, from foundational skills to future industry trends.
            </p>
        </div>
        <div className="absolute top-8 right-8">
          {loading ? null : user ? <UserProfile /> : <Button asChild><Link href="/login">Sign In</Link></Button>}
        </div>
      </header>
      <main className="max-w-4xl mx-auto">
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Career Roadmap</CardTitle>
            <CardDescription>
              Describe your goal or interest (e.g., ‘I want to become an AI Engineer’)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoadmapForm onSubmit={handleGenerate} isLoading={isLoading} />
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center mt-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Generating your roadmap...</p>
            <p className="text-muted-foreground">This may take a moment. Great things are coming!</p>
          </div>
        )}

        <div ref={roadmapRef} className="mt-12">
          {roadmap && <RoadmapDisplay content={roadmap} />}
        </div>
      </main>
       <footer className="text-center mt-16 text-muted-foreground text-sm">
        <p>Powered by Google Gemini. Built for you.</p>
      </footer>
    </div>
  );
}
