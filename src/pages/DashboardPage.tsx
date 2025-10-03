import useAuthStore, { useUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus2, Gift, History, Loader2, Clock, CheckCircle, XCircle, LayoutGrid, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Tool, Contribution } from '@shared/types';
import { ToolCard } from '@/components/ToolCard';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
export default function DashboardPage() {
  const user = useUser();
  const token = useAuthStore(s => s.token);
  const [unlockedTools, setUnlockedTools] = useState<Tool[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  useEffect(() => {
    const fetchUnlockedTools = async () => {
      if (!user || user.unlockedTools.length === 0) {
        setIsLoadingTools(false);
        return;
      }
      try {
        setIsLoadingTools(true);
        const allTools = await api<Tool[]>('/api/tools');
        const userTools = allTools.filter(tool => user.unlockedTools.includes(tool.id));
        setUnlockedTools(userTools);
      } catch (error) {
        toast.error("Failed to load your unlocked tools.");
      } finally {
        setIsLoadingTools(false);
      }
    };
    const fetchContributions = async () => {
      if (!token) {
        setIsLoadingContributions(false);
        return;
      }
      try {
        setIsLoadingContributions(true);
        const userContributions = await api<Contribution[]>('/api/contributions/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContributions(userContributions.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        toast.error("Failed to load your contributions.");
      } finally {
        setIsLoadingContributions(false);
      }
    };
    fetchUnlockedTools();
    fetchContributions();
  }, [user, token]);
  if (!user) {
    return null; // Or a loading state
  }
  const StatusBadge = ({ status }: { status: Contribution['status'] }) => {
    const statusMap = {
      pending: { icon: Clock, color: 'text-yellow-500', text: 'Pending' },
      approved: { icon: CheckCircle, color: 'text-green-500', text: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-500', text: 'Rejected' },
    };
    const { icon: Icon, color, text } = statusMap[status];
    return (
      <Badge variant="outline" className="flex items-center gap-1.5 whitespace-nowrap">
        <Icon className={cn("h-3 w-3", color)} />
        {text}
      </Badge>
    );
  };
  const ContributionsSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tool Name</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold font-display">Welcome back, {user.email.split('@')[0]}!</h1>
          <p className="text-xl text-muted-foreground">Here's a summary of your GrowthKit activity.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.credits} Credits</div>
              <p className="text-xs text-muted-foreground mb-4">Ready to spend on new tools</p>
              <Button size="sm" asChild>
                <Link to="/buy-credits"><PlusCircle className="mr-2 h-4 w-4" />Buy More Credits</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unlocked Tools</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.unlockedTools.length}</div>
              <p className="text-xs text-muted-foreground">Tools in your library</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contributions.length}</div>
              <p className="text-xs text-muted-foreground">Tools submitted for review</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>My Unlocked Tools</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTools ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-xl" />
                      <div className="space-y-2 p-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : unlockedTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">You haven't unlocked any tools yet.</p>
                  <Button asChild>
                    <Link to="/">Explore Tools</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>My Contributions</CardTitle>
                <CardDescription>Track the status of your submitted tools.</CardDescription>
              </div>
              <Button asChild>
                <Link to="/contribute"><FilePlus2 className="mr-2 h-4 w-4" />Submit a Tool</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingContributions ? (
                <ContributionsSkeleton />
              ) : contributions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.toolName}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right"><StatusBadge status={c.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">You haven't submitted any tools yet.</p>
                  <p className="text-sm text-muted-foreground">Contribute to the community and earn credits!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}