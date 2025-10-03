import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bot, PenSquare, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolCard } from '@/components/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Tool } from '@shared/types';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
const features = [
  {
    icon: Zap,
    title: 'Interactive Tools',
    description: 'Go beyond static templates with mini SaaS apps that get the job done.',
  },
  {
    icon: Bot,
    title: 'AI-Powered',
    description: 'Leverage the latest in AI to supercharge your marketing efforts.',
  },
  {
    icon: PenSquare,
    title: 'Community Curated',
    description: 'Access tools vetted and contributed by a community of expert marketers.',
  },
  {
    icon: BarChart,
    title: 'Proven Results',
    description: 'Each tool is based on a lead magnet with a proven track record of success.',
  },
];
type SortOption = 'default' | 'rating' | 'cost-low' | 'cost-high';
export function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  useEffect(() => {
    document.title = 'GrowthKit | The Ultimate Toolkit for Modern Marketers';
    const metaDescription = document.querySelector('meta[name="description"]');
    const newMeta = {
      name: 'description',
      content: 'Unlock a curated library of interactive, high-performance marketing tools. Earn credits by contributing and join a community dedicated to growth.',
    };
    if (metaDescription) {
      metaDescription.setAttribute('content', newMeta.content);
    } else {
      const meta = document.createElement('meta');
      meta.name = newMeta.name;
      meta.content = newMeta.content;
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const data = await api<Tool[]>('/api/tools');
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);
  const categories = useMemo(() => ['All', ...new Set(tools.map(tool => tool.category))], [tools]);
  const sortedAndFilteredTools = useMemo(() => {
    let filtered = tools.filter(tool =>
      (tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (selectedCategory === 'All' || tool.category === selectedCategory)
    );
    switch (sortOption) {
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'cost-low':
        return [...filtered].sort((a, b) => a.cost - b.cost);
      case 'cost-high':
        return [...filtered].sort((a, b) => b.cost - a.cost);
      default:
        return filtered;
    }
  }, [tools, searchTerm, sortOption, selectedCategory]);
  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight">
              The Ultimate Toolkit for <span className="text-indigo-500">Modern Marketers</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock a curated library of interactive, high-performance marketing tools. Earn credits by contributing and join a community dedicated to growth.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#tool-library">Browse Tools</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white mx-auto">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Tool Library Section */}
      <section id="tool-library" className="container max-w-7xl mx-auto px-4 scroll-mt-20">
        <div className="space-y-6 text-center">
          <h2 className="text-4xl font-bold font-display">Tool Library</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover tools to streamline your workflow and amplify your results.
          </p>
        </div>
        <div className="my-8 flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for tools..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={(value: SortOption) => setSortOption(value)} defaultValue="default">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="cost-low">Cost: Low to High</SelectItem>
              <SelectItem value="cost-high">Cost: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ToolSkeleton key={i} />)
            : sortedAndFilteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
        {!loading && sortedAndFilteredTools.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-muted-foreground">No tools found matching your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
}
function ToolSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}