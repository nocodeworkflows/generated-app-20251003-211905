import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle, Info, Loader2, Mail, Sparkles, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import type { SubjectLineRequest, SubjectLineResponse, SubjectLineFeedback } from '@shared/types';
import { cn } from '@/lib/utils';
const subjectLineSchema = z.object({
  subjectLine: z.string().min(5, { message: 'Subject line must be at least 5 characters.' }).max(100, { message: 'Subject line cannot exceed 100 characters.' }),
});
type SubjectLineFormValues = z.infer<typeof subjectLineSchema>;
export function SubjectLineTester() {
  const [results, setResults] = useState<SubjectLineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(s => s.token);
  const form = useForm<SubjectLineFormValues>({
    resolver: zodResolver(subjectLineSchema),
    defaultValues: { subjectLine: '' },
  });
  const onSubmit = async (data: SubjectLineFormValues) => {
    if (!token) {
      toast.error('Authentication error.');
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const response = await api<SubjectLineResponse>('/api/tools/test-subject-line', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      setResults(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to test subject line.');
    } finally {
      setIsLoading(false);
    }
  };
  const getScoreColor = (score: number) => {
    if (score > 80) return 'bg-green-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const feedbackIcons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <TriangleAlert className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };
  return (
    <Card className="w-full bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-indigo-500" />
          Email Subject Line Tester
        </CardTitle>
        <CardDescription>Analyze your subject line for open-rate potential based on best practices.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subjectLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Subject Line</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5 ways to improve your marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analyze Subject Line
            </Button>
          </form>
        </Form>
        {(isLoading || results) && <Separator className="my-8" />}
        {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {results && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Score</span>
                <span className="font-bold text-lg">{results.score}/100</span>
              </div>
              <Progress value={results.score} className={cn(getScoreColor(results.score))} />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Feedback & Suggestions:</h4>
              {results.feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-background">
                  {feedbackIcons[item.type]}
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}