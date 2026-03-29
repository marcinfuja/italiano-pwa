import Dexie, { type Table } from 'dexie';
import defaultData from '../data/vocabulary.json';

export interface Flashcard {
  id: string;
  italian: string;
  polish: string;
  type: "word" | "sentence";
  level: string;
  example?: string;
  
  // Custom user flags
  isCustom?: boolean;
  
  // Spaced repetition fields
  nextReviewDate?: number;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
}

export class AppDB extends Dexie {
  flashcards!: Table<Flashcard, string>;

  constructor() {
    super('ItalianoA1DB');
    this.version(1).stores({
      flashcards: 'id, level, isCustom, nextReviewDate', // id is primary key
    });
  }
}

export const db = new AppDB();

export async function populateIfNotExists() {
  const existingRecords = await db.flashcards.toArray();
  
  if (existingRecords.length === 0) {
    // Pierwsze uruchomienie
    await db.flashcards.bulkPut(defaultData as Flashcard[]);
    return;
  }
  
  // Zapobieganie nadpisywaniu postępów przy ponownych wizytach
  // Jeśli baza już ma te słówka weźmiemy z niej pole repetitions i przypiszemy do nadpisujących danych
  const existingMap = new Map(existingRecords.map(f => [f.id, f]));
  
  const mergedData = (defaultData as Flashcard[]).map(d => {
    const existingEntry = existingMap.get(d.id);
    if (existingEntry) {
      // Zachowaj postęp użytkownika, ale aktualizuj ew. literówki w słowach z pliku JSON
      return { 
        ...d, 
        repetitions: existingEntry.repetitions, 
        nextReviewDate: existingEntry.nextReviewDate 
      };
    }
    return d;
  });

  await db.flashcards.bulkPut(mergedData);
}
