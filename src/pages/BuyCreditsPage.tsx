import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Gift, Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import useAuthStore, { useAuthActions } from '@/lib/auth';
import type { User } from '@shared/types';
const creditPackages = [
  {
    name: 'Starter Pack',
    credits: 10,
    price: 5,
    description: 'Perfect for trying out a few tools.',
    isPopular: false,
  },
  {
    name: 'Growth Hacker',
    credits: 50,
    price: 20,
    description: 'Best value for active marketers.',
    isPopular: true,
  },
  {
    name: 'Agency Bundle',
    credits: 100,
    price: 35,
    description: 'For teams and power users.',
    isPopular: false,
  },
];
export default function BuyCreditsPage() {
  const [loadingPackage, setLoadingPackage] = useState<number | null>(null);
  const token = useAuthStore(s => s.token);
  const { updateUser } = useAuthActions();
  const handlePurchase = async (credits: number) => {
    if (!token) {
      toast.error('You must be logged in to purchase credits.');
      return;
    }
    setLoadingPackage(credits);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedUser = await api<User>('/api/credits/buy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ credits }),
      });
      updateUser(updatedUser);
      toast.success(`${credits} credits added to your account!`, {
        description: `Your new balance is ${updatedUser.credits} credits.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Purchase failed. Please try again.');
    } finally {
      setLoadingPackage(null);
    }
  };
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold font-display">Buy Credits</h1>
        <p className="text-xl text-muted-foreground">
          Unlock more tools by topping up your credit balance.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {creditPackages.map((pkg, index) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={cn("flex flex-col", pkg.isPopular && "border-indigo-500 border-2 relative")}>
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-semibold tracking-wide text-white bg-indigo-500 rounded-full shadow-md">
                  <Star className="inline-block w-4 h-4 mr-1" />
                  POPULAR
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-center space-y-4">
                <div className="flex justify-center items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">${pkg.price}</span>
                </div>
                <div className="flex justify-center items-center gap-2 text-2xl font-bold text-indigo-500">
                  <Gift className="w-8 h-8" />
                  <span>{pkg.credits} Credits</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-green-500" /> Access to all tools</li>
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-green-500" /> One-time purchase</li>
                  <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-green-500" /> Credits never expire</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handlePurchase(pkg.credits)}
                  disabled={loadingPackage !== null}
                >
                  {loadingPackage === pkg.credits ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}