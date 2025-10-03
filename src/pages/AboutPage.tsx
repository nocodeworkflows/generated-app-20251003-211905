import { Gem, Zap, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Gem className="mx-auto h-12 w-12 text-indigo-500" />
          <h1 className="mt-4 text-4xl font-extrabold font-display tracking-tight sm:text-5xl lg:text-6xl">
            About GrowthKit
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground">
            We're on a mission to build the most practical, community-driven toolkit for modern marketers.
          </p>
        </div>
        <div className="mt-20 space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display">From Static to <span className="text-indigo-500">Dynamic</span></h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tired of downloading endless PDFs and templates that just gather digital dust? We were too. GrowthKit transforms the best lead magnets on the internet—checklists, calculators, swipe files—into interactive, mini SaaS tools you can use right in your browser. No more clutter, just results.
              </p>
            </div>
            <div className="flex justify-center">
              <Zap className="h-32 w-32 text-indigo-500 opacity-20" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center order-last md:order-first">
              <Users className="h-32 w-32 text-indigo-500 opacity-20" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-display">Powered by the <span className="text-indigo-500">Community</span></h2>
              <p className="mt-4 text-lg text-muted-foreground">
                GrowthKit is a self-sustaining ecosystem. The best tools are sourced, vetted, and reviewed by marketers like you. By contributing your favorite finds or sharing feedback, you not only help others but also earn credits to unlock more tools for yourself. It's a win-win.
              </p>
            </div>
          </div>
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-display flex items-center gap-2">
                <Gift className="h-6 w-6 text-indigo-500" />
                How the Credit System Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Our platform operates on a simple credit-based economy designed to reward participation and ensure high-quality content.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Unlock Tools:</strong> Every tool in our library costs a small number of credits to unlock permanently.</li>
                <li><strong>Earn by Contributing:</strong> Submit a new, high-quality tool for review. If it's approved, you'll receive a generous credit bonus.</li>
                <li><strong>Earn by Reviewing:</strong> Share your honest feedback on tools you've unlocked to help the community and earn credits.</li>
                <li><strong>Get Started Free:</strong> New users receive complimentary credits to start exploring the library right away.</li>
              </ul>
            </CardContent>
          </Card>
          <div className="text-center">
            <h2 className="text-3xl font-bold font-display">Ready to Grow?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Join a community of forward-thinking marketers and get access to a toolkit that evolves with you.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link to="/signup">Join GrowthKit Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}