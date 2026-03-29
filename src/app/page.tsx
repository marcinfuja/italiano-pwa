"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, populateIfNotExists } from "@/lib/db";
import { Play, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [direction, setDirection] = useState<"it-pl" | "pl-it">("pl-it");

  useEffect(() => {
    // Populate database if empty
    populateIfNotExists().then(() => setIsInitializing(false));
  }, []);

  const flashcards = useLiveQuery(() => db.flashcards.toArray());

  if (isInitializing || !flashcards) {
    return <div style={{ textAlign: "center", padding: "3rem" }}>Ładowanie bazy danych...</div>;
  }

  // Get unique levels
  const levels = Array.from(new Set(flashcards.map(f => f.level))).sort();

  const handleResetLevel = async (levelName: string, cardsToReset: any[]) => {
    if (window.confirm(`Czy na pewno chcesz zresetować postęp w: ${levelName}?`)) {
      try {
        await db.transaction('rw', db.flashcards, async () => {
          for (const card of cardsToReset) {
            await db.flashcards.update(card.id, { repetitions: 0 });
          }
        });
      } catch (err) {
        console.error("Błąd podczas resetowania postępu:", err);
        alert("Wystąpił błąd przy resetowaniu bazy danych.");
      }
    }
  };

  return (
    <div>
      <section style={{ marginBottom: "2rem" }}>
        <h1>Witaj w <span className="title-gradient">Italiano A1</span>! 🍕</h1>
        <p>Wybierz poziom i rozpocznij trening, lub dodaj własne fiszki, żeby uczyć się tego co chcesz.</p>
      </section>

      <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
        <strong>Kierunek nauki:</strong>
        <select 
          className="form-control" 
          style={{ width: "auto" }} 
          value={direction} 
          onChange={(e) => setDirection(e.target.value as "it-pl" | "pl-it")}
        >
          <option value="it-pl">🇮🇹 Włoski ➔ 🇵🇱 Polski</option>
          <option value="pl-it">🇵🇱 Polski ➔ 🇮🇹 Włoski</option>
        </select>
      </div>

      <div>
        <h2>Dostępne lekcje</h2>
        <div className="grid">
          {levels.map((level) => {
            const levelCards = flashcards.filter(f => f.level === level);
            const wordsCount = levelCards.filter(f => f.type === "word").length;
            const sentenceCount = levelCards.filter(f => f.type === "sentence").length;
            
            const knownCount = levelCards.filter(f => (f.repetitions || 0) > 0).length;
            const totalCount = levelCards.length;
            const progressPercent = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;

            return (
              <div key={level} className="glass-card flex-between" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>{level}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {wordsCount > 0 && <span className="badge">{wordsCount} słówek</span>}
                    {sentenceCount > 0 && <span className="badge">{sentenceCount} zdań</span>}
                  </div>
                  
                  <div className="progress-container" style={{ height: "6px", marginBottom: "0.5rem" }}>
                    <div className="progress-bar" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "var(--accent-color)" : "var(--accent-hover)" }}></div>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Opanowano: {knownCount} / {totalCount} ({progressPercent}%)
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/train?level=${encodeURIComponent(level)}&dir=${direction}`} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", flex: 1 }}>
                      <Play size={16} /> Trenuj
                    </Link>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResetLevel(level, levelCards);
                      }} 
                      className="btn btn-outline" 
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }} 
                      title="Resetuj postęp"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "16px" }}>
         <h3>Statystyki ogólne</h3>
         <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
           <div>
             <span style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-color)" }}>{flashcards.length}</span>
             <p>Wszystkich fiszek</p>
           </div>
           <div>
             <span style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--danger-hover)" }}>{flashcards.filter(f => f.isCustom).length}</span>
             <p>Własnych fiszek</p>
           </div>
         </div>
      </div>
    </div>
  );
}
