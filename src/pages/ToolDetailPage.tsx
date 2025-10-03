import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Tool, User, Review } from '@shared/types';
import { ArrowLeft, CheckCircle, Loader2, Lock, Tag, Zap, Twitter, Linkedin, Link as LinkIcon, Send } from 'lucide-react';
import useAuthStore, { useUser, useIsAuthenticated, useAuthActions } from '@/lib/auth';
import { StarRating } from '@/components/StarRating';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { HeadlineGenerator } from '@/components/tools/HeadlineGenerator';
import { ABTestCalculator } from '@/components/tools/ABTestCalculator';
import { SubjectLineTester } from '@/components/tools/SubjectLineTester';
const reviewSchema = z.object({
  rating: z.number().min(1, { message: 'Please select a rating.' }),
  comment: z.string().min(10, { message: 'Review must be at least 10 characters.' }).max(500, { message: 'Review cannot exceed 500 characters.' }),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;
export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { updateUser } = useAuthActions();
  const token = useAuthStore(s => s.token);
  const isUnlocked = user?.unlockedTools.includes(id ?? '') ?? false;
  const hasReviewed = reviews.some(r => r.userId === user?.id);
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });
  const fetchToolAndReviews = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [toolData, reviewData] = await Promise.all([
        api<Tool>(`/api/tools/${id}`),
        api<Review[]>(`/api/tools/${id}/reviews`),
      ]);
      setTool(toolData);
      setReviews(reviewData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      toast.error('Failed to load tool details.');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchToolAndReviews();
  }, [fetchToolAndReviews]);
  useEffect(() => {
    if (tool) {
      document.title = `${tool.title} | GrowthKit`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', tool.description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = tool.description;
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
    }
    return () => {
      document.title = 'GrowthKit';
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'A gamified platform offering curated, interactive marketing tools unlocked by earning credits through community contributions.');
      }
    };
  }, [tool]);
  const handleUnlock = async () => {
    if (!id || !token) return;
    setIsUnlocking(true);
    try {
      const response = await api<{ user: User; tool: Tool }>(`/api/tools/${id}/unlock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser(response.user);
      setTool(prev => prev ? { ...prev, ...response.tool } : response.tool);
      toast.success(`Successfully unlocked "${response.tool.title}"!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unlock tool.');
    } finally {
      setIsUnlocking(false);
    }
  };
  const onReviewSubmit = async (data: ReviewFormValues) => {
    if (!id || !token) return;
    try {
      await api<Review>(`/api/tools/${id}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      toast.success('Thank you for your review!');
      form.reset();
      fetchToolAndReviews(); // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review.');
    }
  };
  if (loading) return <ToolDetailSkeleton />;
  if (!tool) return (
    <div className="container max-w-5xl mx-auto py-12 text-center">
      <h2 className="text-2xl font-bold">Tool not found</h2>
      <p className="text-muted-foreground">The tool you are looking for does not exist.</p>
      <Button asChild variant="link" className="mt-4">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to library</Link>
      </Button>
    </div>
  );
  const canAfford = user ? user.credits >= tool.cost : false;
  const shareUrl = window.location.href;
  const shareTitle = `Check out this marketing tool: ${tool.title}`;
  const UnlockedContent = () => {
    switch (tool.id) {
      case '1':
        return <HeadlineGenerator />;
      case '2':
        return <ABTestCalculator />;
      case '5':
        return <SubjectLineTester />;
      default:
        return (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-6 w-6" />Tool Unlocked!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-semibold">Tool Content:</p>
              <p className="text-lg p-4 bg-background rounded-md mt-2 border">{tool.content}</p>
            </CardContent>
          </Card>
        );
    }
  };
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="ghost">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Tool Library</Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <img src={tool.imageUrl} alt={tool.title} className="rounded-lg shadow-lg w-full aspect-video object-cover" />
        </div>
        <div className="space-y-6">
          <Badge variant="secondary">{tool.category}</Badge>
          <h1 className="text-4xl font-bold font-display">{tool.title}</h1>
          <div className="flex items-center gap-2">
            <StarRating rating={tool.rating} readOnly />
            <span className="text-muted-foreground">{tool.reviewCount > 0 ? `${tool.rating.toFixed(1)} (${tool.reviewCount} reviews)` : 'No reviews yet'}</span>
          </div>
          <p className="text-lg text-muted-foreground">{tool.description}</p>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-muted-foreground" />
            {tool.tags.map(tag => (<Badge key={tag} variant="outline">{tag}</Badge>))}
          </div>
          {isUnlocked ? (
            <UnlockedContent />
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Unlock Cost</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="w-6 h-6 text-indigo-500" /><span className="text-2xl font-bold">{tool.cost} Credits</span>
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <Button size="lg" onClick={handleUnlock} disabled={!canAfford || isUnlocking}>
                      {isUnlocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                      {canAfford ? `Unlock with ${tool.cost} Credits` : 'Not enough credits'}
                    </Button>
                  ) : (
                    <Button size="lg" asChild><Link to="/login"><Lock className="mr-2 h-4 w-4" />Login to Unlock</Link></Button>
                  )}
                </div>
                {isAuthenticated && !canAfford && (<p className="text-sm text-destructive text-center mt-4">You need {tool.cost - (user?.credits ?? 0)} more credits.</p>)}
              </CardContent>
            </Card>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Share:</span>
            <Button variant="outline" size="icon" asChild><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" asChild><a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }}><LinkIcon className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <Separator className="my-12" />
      <div className="space-y-8">
        <h2 className="text-3xl font-bold font-display">Community Reviews</h2>
        {isUnlocked && !hasReviewed && (
          <Card>
            <CardHeader><CardTitle>Leave a Review</CardTitle><CardDescription>Share your thoughts and earn 1 credit!</CardDescription></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onReviewSubmit)} className="space-y-4">
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating</FormLabel>
                      <FormControl><StarRating rating={field.value} onRate={field.onChange} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="comment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl><Textarea placeholder="What did you like or dislike about this tool?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Submit Review
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar><AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${review.userEmail}`} /><AvatarFallback>{review.userEmail?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{review.userEmail?.split('@')[0]}</p>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                      </div>
                      <StarRating rating={review.rating} size={16} readOnly className="my-1" />
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Be the first to review this tool!</p>
        )}
      </div>
    </div>
  );
}
function ToolDetailSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8"><Skeleton className="h-10 w-48" /></div>
      <div className="grid md:grid-cols-2 gap-12">
        <div><Skeleton className="w-full aspect-video rounded-lg" /></div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" />
          <div className="flex items-center gap-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /></div>
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}