import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import type { Contribution, Tool } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, X, Shield, Inbox, Pencil, Trash2, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditToolDialog } from '@/components/EditToolDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export default function AdminPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState({ contributions: true, tools: true });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const token = useAuthStore(s => s.token);
  const fetchContributions = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(prev => ({ ...prev, contributions: true }));
      const data = await api<Contribution[]>('/api/admin/contributions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContributions(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      toast.error('Failed to load contributions.');
    } finally {
      setIsLoading(prev => ({ ...prev, contributions: false }));
    }
  }, [token]);
  const fetchTools = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(prev => ({ ...prev, tools: true }));
      const data = await api<Tool[]>('/api/admin/tools', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTools(data);
    } catch (error) {
      toast.error('Failed to load tools.');
    } finally {
      setIsLoading(prev => ({ ...prev, tools: false }));
    }
  }, [token]);
  useEffect(() => {
    fetchContributions();
    fetchTools();
  }, [fetchContributions, fetchTools]);
  const handleContributionAction = async (id: string, action: 'approve' | 'reject') => {
    if (!token) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api(`/api/admin/contributions/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Contribution has been ${action}d.`);
      await fetchContributions();
      if (action === 'approve') await fetchTools();
    } catch (error) {
      toast.error(`Failed to ${action} contribution.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  const handleToolUpdate = (updatedTool: Tool) => {
    setTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
  };
  const handleToolDelete = async (id: string) => {
    if (!token) return;
    try {
      await api(`/api/admin/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tool deleted successfully.');
      setTools(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      toast.error('Failed to delete tool.');
    }
  };
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="space-y-2 mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold font-display">Admin Panel</h1>
        </div>
        <p className="text-xl text-muted-foreground">Manage user contributions and platform content.</p>
      </header>
      <Tabs defaultValue="submissions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="tools">Manage Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Submissions</CardTitle>
              <CardDescription>Review and moderate all tools submitted by the community.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsTable
                contributions={contributions}
                isLoading={isLoading.contributions}
                actionLoading={actionLoading}
                onAction={handleContributionAction}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Tool Management</CardTitle>
              <CardDescription>Edit or delete existing tools in the library.</CardDescription>
            </CardHeader>
            <CardContent>
              <ToolsTable
                tools={tools}
                isLoading={isLoading.tools}
                onEdit={setEditingTool}
                onDelete={handleToolDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {editingTool && (
        <EditToolDialog
          tool={editingTool}
          onOpenChange={(isOpen) => !isOpen && setEditingTool(null)}
          onUpdate={handleToolUpdate}
        />
      )}
    </div>
  );
}
function SubmissionsTable({ contributions, isLoading, actionLoading, onAction }) {
  if (isLoading) return <AdminTableSkeleton />;
  if (contributions.length === 0) return <EmptyState message="There are no pending contributions to review." />;
  const StatusBadge = ({ status }: { status: Contribution['status'] }) => {
    const statusMap = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' },
    };
    const { color, text } = statusMap[status];
    return <Badge className={cn(color, "text-white")}>{text}</Badge>;
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tool Name</TableHead>
          <TableHead>Submitted By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map(c => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">
              <a href={c.toolUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{c.toolName}</a>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{c.description}</p>
            </TableCell>
            <TableCell>{c.userEmail}<br /><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span></TableCell>
            <TableCell><StatusBadge status={c.status} /></TableCell>
            <TableCell className="text-right">
              {c.status === 'pending' ? (
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => onAction(c.id, 'approve')} disabled={actionLoading[c.id]}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onAction(c.id, 'reject')} disabled={actionLoading[c.id]}><X className="h-4 w-4" /></Button>
                </div>
              ) : <span className="text-sm text-muted-foreground">Reviewed</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function ToolsTable({ tools, isLoading, onEdit, onDelete }) {
  if (isLoading) return <AdminTableSkeleton />;
  if (tools.length === 0) return <EmptyState message="No tools found in the library." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tool</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map(tool => (
          <TableRow key={tool.id}>
            <TableCell className="font-medium">{tool.title}<p className="text-xs text-muted-foreground">{tool.category}</p></TableCell>
            <TableCell>{tool.cost} credits</TableCell>
            <TableCell className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> {tool.rating.toFixed(1)} ({tool.reviewCount})</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => onEdit(tool)}><Pencil className="h-4 w-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone. This will permanently delete the tool "{tool.title}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(tool.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function AdminTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="text-right"><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function EmptyState({ message }) {
  return (
    <div className="text-center py-16">
      <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}