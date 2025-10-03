import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Bot, Clipboard, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import type { HeadlineRequest, HeadlineResponse } from '@shared/types';
const headlineSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }).max(50, { message: 'Topic cannot exceed 50 characters.' }),
  tone: z.enum(['Professional', 'Casual', 'Bold', 'Witty', 'Informative']),
});
type HeadlineFormValues = z.infer<typeof headlineSchema>;
export function HeadlineGenerator() {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(s => s.token);
  const form = useForm<HeadlineFormValues>({
    resolver: zodResolver(headlineSchema),
    defaultValues: {
      topic: '',
      tone: 'Professional',
    },
  });
  const onSubmit = async (data: HeadlineFormValues) => {
    if (!token) {
      toast.error('Authentication error.');
      return;
    }
    setIsLoading(true);
    setHeadlines([]);
    try {
      const response = await api<HeadlineResponse>('/api/tools/generate-headline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      setHeadlines(response.headlines);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate headlines.');
    } finally {
      setIsLoading(false);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Headline copied to clipboard!');
  };
  return (
    <Card className="w-full bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-500" />
          AI Headline Generator
        </CardTitle>
        <CardDescription>Enter a topic and select a tone to generate compelling headlines.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'React state management'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Professional', 'Casual', 'Bold', 'Witty', 'Informative'].map(tone => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Headlines
            </Button>
          </form>
        </Form>
        {(isLoading || headlines.length > 0) && <Separator className="my-8" />}
        <div className="mt-6 space-y-4">
          {isLoading && (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </div>
            ))
          )}
          {!isLoading && headlines.length > 0 && (
            <div className="space-y-3">
              {headlines.map((headline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">{headline}</p>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(headline)}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}