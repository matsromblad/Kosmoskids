
"use client";

import { useState, useEffect } from 'react';
import { Users, Rocket, Globe2 } from 'lucide-react';
import Image from 'next/image';
import { MainMenuButton } from '@/components/game/MainMenuButton';

interface StoredCharacter {
  name: string;
  imageUrl: string;
  backstory: string;
  style: string;
}

interface StoredSpaceship {
  imageUrl: string;
  backstory: string | null; 
  style: string | null; 
  parts: {
    wing: string | null;
    engine: string | null;
    decoration: string | null;
  };
   partNames: {
    wingName: string;
    engineName: string;
    decorationName: string;
  }
}

const CHARACTER_STORAGE_KEY = "kosmoskids_character";
const SPACESHIP_STORAGE_KEY = "kosmoskids_spaceship";

export default function Home() {
  const [characterData, setCharacterData] = useState<StoredCharacter | null>(null);
  const [spaceshipData, setSpaceshipData] = useState<StoredSpaceship | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("https://placehold.co/200x200.png");

  useEffect(() => {
    const storedCharacterRaw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (storedCharacterRaw) {
      try {
        setCharacterData(JSON.parse(storedCharacterRaw));
      } catch (e) {
        console.error("Failed to parse stored character data", e);
        localStorage.removeItem(CHARACTER_STORAGE_KEY); 
      }
    }

    const storedSpaceshipRaw = localStorage.getItem(SPACESHIP_STORAGE_KEY);
    if (storedSpaceshipRaw) {
      try {
        setSpaceshipData(JSON.parse(storedSpaceshipRaw));
      } catch (e) {
        console.error("Failed to parse stored spaceship data", e);
        localStorage.removeItem(SPACESHIP_STORAGE_KEY); 
      }
    }
    // For now, we use a static placeholder for the logo to reduce API calls.
    // If AI generation for the logo is desired later, this can be re-enabled carefully.
    // e.g., by calling generateImage({prompt: "cute alien planet logo"}) and setting setLogoUrl
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-indigo-900/50">
      <header className="text-center mb-12">
         <div className="relative w-40 h-40 mx-auto mb-4">
            <Image 
                src={logoUrl}
                alt="Kosmoskids Logotyp" 
                width={200}
                height={200}
                className="rounded-full object-contain"
                // data-ai-hint="cute alien planet logo" // Removed to prevent AI generation for logo
            />
        </div>
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
          icon={!characterData?.imageUrl ? Users : undefined}
          title="Min Varelse"
          description={characterData?.name ? `Anpassa ${characterData.name} eller skapa en ny!` : "Skapa och styla din unika rymdvarelse."}
          className="bg-violet-500/30 hover:bg-violet-500/40 border-violet-400"
          imageUrl={characterData?.imageUrl}
          characterName={characterData?.name}
        />
        <MainMenuButton
          href="/anpassa-skepp"
          icon={!spaceshipData?.imageUrl ? Rocket : undefined}
          title="Mitt Skepp"
          description={spaceshipData?.imageUrl ? "Visa och anpassa ditt rymdskepp." : "Bygg och designa ditt drömrymdskepp."}
          className="bg-pink-500/30 hover:bg-pink-500/40 border-pink-400"
          imageUrl={spaceshipData?.imageUrl}
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
