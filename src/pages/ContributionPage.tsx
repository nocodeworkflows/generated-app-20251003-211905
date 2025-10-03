import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
const contributionSchema = z.object({
  toolName: z.string().min(3, { message: 'Tool name must be at least 3 characters.' }),
  toolUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
});
type ContributionFormValues = z.infer<typeof contributionSchema>;
export default function ContributionPage() {
  const navigate = useNavigate();
  const token = useAuthStore(s => s.token);
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      toolName: '',
      toolUrl: '',
      description: '',
    },
  });
  const { isSubmitting } = form.formState;
  const onSubmit = async (data: ContributionFormValues) => {
    if (!token) {
      toast.error('You must be logged in to submit a tool.');
      return;
    }
    try {
      await api('/api/contributions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      toast.success('Thank you for your contribution!', {
        description: 'Your submission is now under review. You will be notified upon approval.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    }
  };
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold font-display">Contribute a Tool</h1>
        <p className="text-xl text-muted-foreground">
          Share a valuable marketing tool with the community and earn credits upon approval.
        </p>
      </div>
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>New Tool Submission</CardTitle>
          <CardDescription>
            Please provide details about the lead magnet or tool you'd like to submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="toolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tool Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ultimate SEO Checklist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toolUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tool URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/lead-magnet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why is this tool valuable?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the tool and what makes it useful for marketers..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit for Review
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}