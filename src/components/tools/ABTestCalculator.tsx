import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertCircle, Calculator, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import type { ABTestResponse } from '@shared/types';
import { cn } from '@/lib/utils';
const abTestSchema = z.object({
  visitorsA: z.coerce.number().int().min(1, 'Must be at least 1'),
  conversionsA: z.coerce.number().int().min(0, 'Cannot be negative'),
  visitorsB: z.coerce.number().int().min(1, 'Must be at least 1'),
  conversionsB: z.coerce.number().int().min(0, 'Cannot be negative'),
}).refine(data => data.conversionsA <= data.visitorsA, {
  message: 'Conversions cannot exceed visitors for Variant A',
  path: ['conversionsA'],
}).refine(data => data.conversionsB <= data.visitorsB, {
  message: 'Conversions cannot exceed visitors for Variant B',
  path: ['conversionsB'],
});
type ABTestFormValues = z.infer<typeof abTestSchema>;
export function ABTestCalculator() {
  const [results, setResults] = useState<ABTestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(s => s.token);
  const form = useForm<ABTestFormValues>({
    resolver: zodResolver(abTestSchema),
    defaultValues: { visitorsA: 1000, conversionsA: 100, visitorsB: 1000, conversionsB: 120 },
  });
  const onSubmit = async (data: ABTestFormValues) => {
    if (!token) {
      toast.error('Authentication error.');
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const response = await api<ABTestResponse>('/api/tools/calculate-ab-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      setResults(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to calculate results.');
    } finally {
      setIsLoading(false);
    }
  };
  const ResultAlert = () => {
    if (!results) return null;
    if (results.significant) {
      return (
        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-300">Result is Statistically Significant!</AlertTitle>
          <AlertDescription>
            With {results.confidence} confidence, Variant <span className="font-bold">{results.winner}</span> is the winner.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">Result is Not Significant</AlertTitle>
        <AlertDescription>
          There is not enough evidence to declare a winner. You may need to collect more data.
        </AlertDescription>
      </Alert>
    );
  };
  return (
    <Card className="w-full bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calculator className="h-6 w-6 text-indigo-500" />A/B Test Significance Calculator</CardTitle>
        <CardDescription>Enter visitor and conversion data for two variants to determine the statistical significance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium text-center">Variant A (Control)</h3>
                <FormField control={form.control} name="visitorsA" render={({ field }) => (<FormItem><FormLabel>Visitors</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="conversionsA" render={({ field }) => (<FormItem><FormLabel>Conversions</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium text-center">Variant B (Challenger)</h3>
                <FormField control={form.control} name="visitorsB" render={({ field }) => (<FormItem><FormLabel>Visitors</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="conversionsB" render={({ field }) => (<FormItem><FormLabel>Conversions</FormLabel><FormControl><Input type="number" placeholder="e.g., 120" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Calculate Significance'}</Button>
          </form>
        </Form>
        {(isLoading || results) && <Separator className="my-8" />}
        {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {results && (
          <div className="space-y-6">
            <ResultAlert />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={cn(results.winner === 'A' && 'border-green-500')}>
                <CardHeader><CardTitle>Variant A</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{(results.rateA * 100).toFixed(2)}%</p><p className="text-sm text-muted-foreground">Conversion Rate</p></CardContent>
              </Card>
              <Card className={cn(results.winner === 'B' && 'border-green-500')}>
                <CardHeader><CardTitle>Variant B</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{(results.rateB * 100).toFixed(2)}%</p><p className="text-sm text-muted-foreground">Conversion Rate</p></CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}