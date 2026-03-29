"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Flashcard as FlashcardType, populateIfNotExists } from "@/lib/db";
import Flashcard from "@/components/Flashcard";
import { ArrowLeft, Check, X } from "lucide-react";

function TrainLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = searchParams.get("level");
  const dir = searchParams.get("dir") as "it-pl" | "pl-it" || "pl-it";
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    populateIfNotExists();
  }, []);

  const cards = useLiveQuery(
    () => {
      if (!level) return db.flashcards.toArray();
      return db.flashcards.where("level").equals(level).toArray();
    },
    [level]
  );

  if (!cards) return <div style={{textAlign: "center", padding: "3rem"}}>Ładowanie bazy...</div>;
  if (cards.length === 0) return <div style={{textAlign: "center", padding: "3rem"}}>Brak fiszek w tym poziomie.</div>;

  const handleNext = async (known: boolean) => {
    if (known) {
      const card = cards[currentIndex];
      await db.flashcards.update(card.id, { repetitions: (card.repetitions || 0) + 1 });
    }
    
    setShowControls(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("Koniec treningu! Wracamy do głównego menu.");
      router.push("/");
    }
  };

  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
        <button className="btn-icon" onClick={() => router.push("/")} style={{ marginRight: "1rem" }}>
          <ArrowLeft size={20} />
        </button>
        <h2>Trenujesz: {level || "Wszystkie z bazy"}</h2>
      </div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <Flashcard 
         key={cards[currentIndex].id} // Force remount on card change so it resets state
         card={cards[currentIndex]} 
         direction={dir}
         onFlip={() => setShowControls(true)} 
      />

      <div className="training-controls" style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none", transition: "opacity 0.3s" }}>
         <button className="btn btn-danger" onClick={() => handleNext(false)}>
           <X size={20} /> O rany, nie wiem
         </button>
         <button className="btn btn-primary" onClick={() => handleNext(true)}>
           <Check size={20} /> Znam to!
         </button>
      </div>
    </>
  );
}

export default function TrainPage() {
   return (
      <Suspense fallback={<div>Ładowanie widoku...</div>}>
         <TrainLogic />
      </Suspense>
   );
}
