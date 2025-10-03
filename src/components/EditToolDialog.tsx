import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/lib/api-client';
import useAuthStore from '@/lib/auth';
import type { Tool } from '@shared/types';
import { Loader2 } from 'lucide-react';
const editToolSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  cost: z.coerce.number().int().min(0, 'Cost cannot be negative.'),
  category: z.string().min(2, 'Category is required.'),
  tags: z.string(), // The form input will be a single string
});
type EditToolFormValues = z.infer<typeof editToolSchema>;
interface EditToolDialogProps {
  tool: Tool;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (updatedTool: Tool) => void;
}
export function EditToolDialog({ tool, onOpenChange, onUpdate }: EditToolDialogProps) {
  const token = useAuthStore(s => s.token);
  const form = useForm<EditToolFormValues>({
    resolver: zodResolver(editToolSchema),
    defaultValues: {
      title: tool.title,
      description: tool.description,
      cost: tool.cost,
      category: tool.category,
      tags: tool.tags.join(', '),
    },
  });
  const { isSubmitting } = form.formState;
  const onSubmit = async (data: EditToolFormValues) => {
    if (!token) {
      toast.error('Authentication error.');
      return;
    }
    // Transform the tags string into an array for the API
    const apiPayload = {
      ...data,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    try {
      const updatedTool = await api<Tool>(`/api/admin/tools/${tool.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(apiPayload),
      });
      toast.success('Tool updated successfully!');
      onUpdate(updatedTool);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update tool.');
    }
  };
  return (
    <Dialog open={!!tool} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tool: {tool.title}</DialogTitle>
          <DialogDescription>Make changes to the tool details here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Cost (Credits)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}