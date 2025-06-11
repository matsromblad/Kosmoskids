
"use client";

import { useState, useEffect } from 'react';
import { Users, Rocket, Globe2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { MainMenuButton } from '@/components/game/MainMenuButton';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StoredCharacter {
  name: string;
  imageUrl: string;
  backstory: string;
  style: string;
}

interface StoredSpaceship {
  name: string | null;
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
const LOGO_STORAGE_KEY = "kosmoskids_logo";
const ACTIVE_PLANET_IDS_KEY = "kosmoskids_active_planet_ids";
const PLANET_IMAGES_KEY = "kosmoskids_planet_images";
const VISITED_PLANETS_KEY = "kosmoskids_visited_planets";
const CHARACTER_CUSTOMIZATION_OPTIONS_KEY_V1 = "KOSMOSKIDS_CHARACTER_CUSTOMIZATION_OPTIONS_V1";
const SPACESHIP_CUSTOMIZATION_OPTIONS_KEY_V1 = "KOSMOSKIDS_SPACESHIP_CUSTOMIZATION_OPTIONS_V1";


export default function Home() {
  const [characterData, setCharacterData] = useState<StoredCharacter | null>(null);
  const [spaceshipData, setSpaceshipData] = useState<StoredSpaceship | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState<boolean>(false);
  const { toast } = useToast();

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

    const storedLogoUrl = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogoUrl) {
      setLogoImageUrl(storedLogoUrl);
    } else {
      setIsLoadingLogo(true);
      generateImage({ prompt: "planet logo space kids game vibrant colors" })
        .then(result => {
          setLogoImageUrl(result.imageDataUri);
          try {
            localStorage.setItem(LOGO_STORAGE_KEY, result.imageDataUri);
          } catch (e: any) {
            // If logo saving fails due to quota, it's not critical.
            // The app will try to regenerate next time or use placeholder.
            console.warn("Could not save logo to localStorage, likely due to quota", e.message);
          }
        })
        .catch(error => {
          console.error("Failed to generate logo image:", error);
          setLogoImageUrl("https://placehold.co/200x200/2E3192/FFFFFF.png?text=Kosmos");
        })
        .finally(() => {
          setIsLoadingLogo(false);
        });
    }
  }, []);

  const handleStartOver = () => {
    localStorage.removeItem(CHARACTER_STORAGE_KEY);
    localStorage.removeItem(SPACESHIP_STORAGE_KEY);
    localStorage.removeItem(LOGO_STORAGE_KEY); 
    localStorage.removeItem(ACTIVE_PLANET_IDS_KEY);
    localStorage.removeItem(PLANET_IMAGES_KEY);
    localStorage.removeItem(VISITED_PLANETS_KEY);
    localStorage.removeItem(CHARACTER_CUSTOMIZATION_OPTIONS_KEY_V1);
    localStorage.removeItem(SPACESHIP_CUSTOMIZATION_OPTIONS_KEY_V1);


    setCharacterData(null);
    setSpaceshipData(null);
    setLogoImageUrl(null); 
    setIsLoadingLogo(true); 
     generateImage({ prompt: "planet logo space kids game vibrant colors" }) 
        .then(result => {
          setLogoImageUrl(result.imageDataUri);
           try {
            localStorage.setItem(LOGO_STORAGE_KEY, result.imageDataUri);
          } catch (e: any) {
            console.warn("Could not save regenerated logo to localStorage, likely due to quota", e.message);
          }
        })
        .catch(error => {
          console.error("Failed to generate logo image:", error);
          setLogoImageUrl("https://placehold.co/200x200/2E3192/FFFFFF.png?text=Kosmos");
        })
        .finally(() => {
          setIsLoadingLogo(false);
        });

    toast({
      title: "Spelet Återställt!",
      description: "Din varelse, skepp och utforskningsframsteg har nollställts. Nya planeter och anpassningsalternativ väntar!",
      variant: "default"
    });
  };
  
  const canExplore = !!characterData?.imageUrl && !!spaceshipData?.imageUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-indigo-900/50">
      <header className="text-center mb-12">
         <div className="relative w-40 h-40 mx-auto mb-4">
            {isLoadingLogo && !logoImageUrl ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : logoImageUrl ? (
              <Image
                  src={logoImageUrl}
                  alt="Kosmoskids Logotyp"
                  width={200}
                  height={200}
                  className="rounded-full object-contain"
                  data-ai-hint="planet logo"
              />
            ) : ( 
              <Image
                src="https://placehold.co/200x200/2E3192/FFFFFF.png?text=Kosmos"
                alt="Kosmoskids Logotyp Placeholder"
                width={200}
                height={200}
                className="rounded-full object-contain"
                data-ai-hint="planet logo"
            />
            )}
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
          description={spaceshipData?.name ? `Visa och anpassa ${spaceshipData.name}.` : (spaceshipData?.imageUrl ? "Visa och anpassa ditt rymdskepp." : "Bygg och designa ditt drömrymdskepp.")}
          className="bg-pink-500/30 hover:bg-pink-500/40 border-pink-400"
          imageUrl={spaceshipData?.imageUrl}
          spaceshipName={spaceshipData?.name}
        />
        
        {canExplore ? (
          <MainMenuButton
            href="/rymdkarta"
            icon={Globe2}
            title="Utforska"
            description="Upptäck planeter och ge dig ut på äventyr."
            className="bg-sky-500/30 hover:bg-sky-500/40 border-sky-400"
          />
        ) : (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("rounded-lg", !canExplore && "opacity-60 cursor-not-allowed grayscale-[50%]")}>
                   <MainMenuButton
                    href="/rymdkarta" 
                    icon={Globe2}
                    title="Utforska"
                    description="Upptäck planeter och ge dig ut på äventyr."
                    className={cn("bg-sky-500/30 border-sky-400", !canExplore && "pointer-events-none")}
                    disabled={!canExplore}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Du måste skapa både en varelse och ett rymdskepp innan du kan utforska!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </main>

      {(characterData || spaceshipData) && (
        <div className="mt-10 w-full max-w-xs mx-auto">
            <Button variant="outline" onClick={handleStartOver} className="w-full font-semibold border-accent hover:bg-accent/20 hover:text-accent-foreground">
            <RotateCcw className="mr-2 h-5 w-5" />
            Börja Om Spelet
            </Button>
        </div>
      )}

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Kosmoskids. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  );
}
    
