"use client";

import { useState } from "react";
import { Flashcard as FlashcardType } from "@/lib/db";
import { Volume2 } from "lucide-react";

interface Props {
  card: FlashcardType;
  onFlip?: () => void;
  direction?: "it-pl" | "pl-it";
}

export default function Flashcard({ card, onFlip, direction = "pl-it" }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      if (onFlip) onFlip();
    }
  }
  
  const playAudio = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Zapobiega obróceniu karty po kliknięciu ikony
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT'; // Mowa Włoska
      utterance.rate = 0.85; // Odrobinę wolniejsze, wyraźniejsze dyktowanie
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Twoja przeglądarka nie wspiera systemowego odtwarzania mowy.");
    }
  };

  const isItToPl = direction === "it-pl";
  const frontWord = isItToPl ? card.italian : card.polish;
  const backWord = isItToPl ? card.polish : card.italian;
  const frontType = isItToPl ? (card.type === 'word' ? 'SŁÓWKO' : 'ZDANIE') : "TŁUMACZENIE (PL)";
  const backType = isItToPl ? "TŁUMACZENIE (PL)" : (card.type === 'word' ? 'WŁOSKI' : 'WŁOSKI');

  return (
    <div className="scene">
      <div 
        className={`flashcard ${isFlipped ? "is-flipped" : ""}`} 
        onClick={handleFlip}
      >
        <div className="card-face card-face-front">
          <span className="word-type">{frontType}</span>
          <div className="main-word" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {frontWord}
            {isItToPl && (
               <button onClick={(e) => playAudio(card.italian, e)} className="btn-icon" style={{ padding: "0.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} title="Posłuchaj wymowy">
                 <Volume2 size={24} color="#fff" />
               </button>
            )}
          </div>
          <div style={{opacity: 0.5, fontSize: "0.9rem", marginTop: "2rem"}}>👇 Kliknij aby sprawdzić odpowiedź</div>
        </div>
        
        <div className="card-face card-face-back">
          <span className="word-type">{backType}</span>
          <div className="main-word" style={{ fontSize: "2rem", color: "#fff", background: "none", WebkitTextFillColor: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {backWord}
            {!isItToPl && (
               <button onClick={(e) => playAudio(card.italian, e)} className="btn-icon" style={{ padding: "0.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} title="Posłuchaj wymowy">
                 <Volume2 size={24} color="#fff" />
               </button>
            )}
          </div>
          {card.example && (
             <div className="example-sentence" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
               "{card.example}"
               <button onClick={(e) => playAudio(card.example!, e)} className="btn-icon" style={{ padding: "0.4rem", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} title="Posłuchaj zdania">
                 <Volume2 size={16} color="#aaa" />
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
