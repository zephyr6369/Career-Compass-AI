'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const roadmapFormSchema = z.object({
  goal: z.string().min(10, {
    message: 'Please describe your goal in at least 10 characters.',
  }).max(200, {
    message: 'Your goal description must not exceed 200 characters.',
  }),
});

export type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

interface RoadmapFormProps {
  onSubmit: (data: RoadmapFormValues) => void;
  isLoading: boolean;
}

export function RoadmapForm({ onSubmit, isLoading }: RoadmapFormProps) {
  const form = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: {
      goal: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'I want to build and deploy scalable machine learning models.'"
                  className="resize-none min-h-[100px] bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-accent/50"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Generate Roadmap
        </Button>
      </form>
    </Form>
  );
}
