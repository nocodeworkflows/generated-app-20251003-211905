import { Gem, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Footer() {
  return (
    <footer className="bg-muted/40">
      <div className="container max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Gem className="h-8 w-8 text-indigo-500" />
              <span className="font-bold text-2xl font-display">GrowthKit</span>
            </Link>
            <p className="text-muted-foreground text-base">
              A gamified platform for top-tier marketing tools.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Solutions</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Marketing</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Analytics</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">SEO</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Copywriting</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Documentation</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Guides</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Blog</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Jobs</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Privacy</Link></li>
                  <li><Link to="#" className="text-base text-muted-foreground hover:text-foreground">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-muted-foreground xl:text-center">
            &copy; {new Date().getFullYear()} GrowthKit. Built with ❤️ at Cloudflare.
          </p>
        </div>
      </div>
    </footer>
  );
}