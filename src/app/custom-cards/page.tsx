"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, Flashcard } from "@/lib/db";
import { Save, AlertCircle } from "lucide-react";

export default function CustomCardsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    italian: "",
    polish: "",
    type: "word",
    example: ""
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.italian || !formData.polish) {
      alert("Wypełnij włoskie słowo i polskie tłumaczenie.");
      return;
    }

    const newCard: Flashcard = {
      id: "custom-" + Date.now().toString(),
      italian: formData.italian.trim(),
      polish: formData.polish.trim(),
      type: formData.type as "word" | "sentence",
      level: "Twoje własne fiszki",
      example: formData.example.trim(),
      isCustom: true,
      nextReviewDate: Date.now()
    };

    try {
      await db.flashcards.add(newCard);
      setMessage("Zapisano fiszkę!");
      setFormData({
        italian: "",
        polish: "",
        type: "word",
        example: ""
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Błąd zapisu.");
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Dodaj własną fiszkę</h2>
      <p style={{ marginBottom: "2rem" }}>Buduj swoją własną bazę wiedzy dodając zwroty, których aktualnie potrzebujesz.</p>

      {message && (
        <div style={{ padding: "1rem", background: "var(--accent-color)", color: "#fff", borderRadius: "8px", marginBottom: "1rem" }}>
          <AlertCircle size={20} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "0.5rem" }} />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Typ</label>
          <select 
            className="form-control"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="word">Słówko / Krótki zwrot</option>
            <option value="sentence">Całe zdanie</option>
          </select>
        </div>

        <div className="form-group">
          <label>Po włosku</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder={formData.type === 'word' ? "np. Ragazzo" : "np. Quanti anni hai?"}
            value={formData.italian}
            onChange={e => setFormData({...formData, italian: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Tłumaczenie (po polsku)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder={formData.type === 'word' ? "Chłopiec" : "Ile masz lat?"}
            value={formData.polish}
            onChange={e => setFormData({...formData, polish: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Przykład w zdaniu / Kontekst (opcjonalnie)</label>
          <textarea 
            className="form-control" 
            placeholder="np. Ciao, sono un ragazzo italiano."
            value={formData.example}
            rows={3}
            onChange={e => setFormData({...formData, example: e.target.value})}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
          <Save size={20} /> Zapisz do bazy i powtarzaj
        </button>
      </form>
    </div>
  );
}
