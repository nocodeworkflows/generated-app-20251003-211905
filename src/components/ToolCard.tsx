import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tool } from '@shared/types';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
interface ToolCardProps {
  tool: Tool;
  className?: string;
}
export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Link to={`/tools/${tool.id}`} className="block h-full">
        <Card className={cn("flex flex-col h-full overflow-hidden transition-all duration-200 ease-in-out border-border/60 hover:shadow-xl hover:border-primary/30", className)}>
          <CardHeader className="p-0">
            <div
              className="aspect-w-16 aspect-h-9 bg-cover bg-center"
              style={{ backgroundImage: `url(${tool.imageUrl})` }}
              role="img"
              aria-label={tool.title}
            />
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="secondary">{tool.category}</Badge>
              <div className="flex items-center gap-1.5">
                <StarRating rating={tool.rating} size={16} readOnly />
                <span className="text-xs text-muted-foreground">({tool.reviewCount})</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold mb-2 text-primary">{tool.title}</CardTitle>
            <CardDescription className="text-muted-foreground">{tool.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              <div className="flex gap-1.5">
                {tool.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-primary">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>{tool.cost}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}