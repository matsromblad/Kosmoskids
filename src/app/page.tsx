import { Users, Rocket, Globe2 } from 'lucide-react';
import { MainMenuButton } from '@/components/game/MainMenuButton';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-indigo-900/50">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary animate-pulse">
          Kosmoskids
        </h1>
        <p className="text-xl md:text-2xl text-foreground mt-4">
          Välkommen till ditt rymdäventyr!
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl">
        <MainMenuButton
          href="/anpassa-varelse"
          icon={Users}
          title="Min Varelse"
          description="Skapa och styla din unika rymdvarelse."
          className="bg-violet-500/30 hover:bg-violet-500/40 border-violet-400"
        />
        <MainMenuButton
          href="/anpassa-skepp"
          icon={Rocket}
          title="Mitt Skepp"
          description="Bygg och designa ditt drömrymdskepp."
          className="bg-pink-500/30 hover:bg-pink-500/40 border-pink-400"
        />
        <MainMenuButton
          href="/rymdkarta"
          icon={Globe2}
          title="Utforska"
          description="Upptäck planeter och ge dig ut på äventyr."
          className="bg-sky-500/30 hover:bg-sky-500/40 border-sky-400"
        />
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Kosmoskids. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  );
}
