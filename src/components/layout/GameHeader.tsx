import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameHeaderProps {
  title: string;
  backHref?: string;
}

export function GameHeader({ title, backHref = "/" }: GameHeaderProps) {
  return (
    <header className="py-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 bg-background/90 backdrop-blur-md shadow-lg border-b border-border">
      <Button variant="ghost" size="icon" asChild className="hover:bg-primary/20">
        <Link href={backHref} aria-label="Tillbaka">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Link>
      </Button>
      <h1 className="text-xl sm:text-2xl font-headline font-semibold text-primary text-center truncate px-2">
        {title}
      </h1>
      <div className="w-10"></div> {/* Spacer to balance the back button */}
    </header>
  );
}
