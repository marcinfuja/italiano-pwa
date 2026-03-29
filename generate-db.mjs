import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

const url = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/it/it_50k.txt';

async function run() {
  console.log('Pobieranie 2000 najpopularniejszych włoskich słów...');
  const res = await fetch(url);
  const text = await res.text();
  
  // top 2000 words (skipping the very common articles to focus on real words)
  const lines = text.split('\n').filter(Boolean).slice(10, 2010);
  
  const words = lines.map(line => line.split(' ')[0]);
  console.log(`Pobrano ${words.length} słów. Rozpoczynam tłumaczenie na polski w partiach...`);
  
  const database = [];
  const chunkSize = 100; // smaller chunk size for reliability
  const chunks = [];
  for(let i=0; i<words.length; i+=chunkSize) {
     chunks.push(words.slice(i, i+chunkSize));
  }
  
  let idCounter = 1;
  const levels = [
    "A1 - Seria 1 (Najczęstsze)", 
    "A1 - Seria 2", 
    "A1 - Seria 3", 
    "A2 - Seria 4", 
    "A2 - Seria 5", 
    "A2 - Seria 6"
  ];

  for (let i = 0; i < chunks.length; i++) {
     try {
       console.log(`Tłumaczenie partii ${i + 1}/${chunks.length}...`);
       const textToTranslate = chunks[i].join('\n');
       const { text: translatedText } = await translate(textToTranslate, { from: 'it', to: 'pl' });
       const translatedWords = translatedText.split('\n');
       
       for(let j=0; j<chunks[i].length; j++) {
          const italian = chunks[i][j];
          let polish = translatedWords[j] || italian;
          polish = polish.replace(/\r/g, '').trim();
          
          let levelIndex = Math.floor((idCounter / 2000) * levels.length);
          if (levelIndex >= levels.length) levelIndex = levels.length - 1;
          
          database.push({
            id: `gen-vocab-${idCounter++}`,
            italian: italian,
            polish: polish,
            type: "word",
            level: levels[levelIndex]
          });
       }
       // Wait slightly to not overload translation API
       await new Promise(r => setTimeout(r, 2000));
     } catch (e) {
       console.error(`Błąd przy chunku ${i + 1}:`, e.message);
     }
  }
  
  console.log('Generowanie dodatkowych 300 podstawowych zdań z kombinacji...');
  const subjects = [
    {it: "Io", pl: "Ja"}, {it: "Tu", pl: "Ty"}, {it: "Lui", pl: "On"}, {it: "Lei", pl: "Ona"}, 
    {it: "Noi", pl: "My"}, {it: "Voi", pl: "Wy"}, {it: "Loro", pl: "Oni"}
  ];
  const verbsAndObjects = [
    {it: "voglio mangiare una pizza.", pl: "chcę zjeść pizzę."},
    {it: "devo andare a casa.", pl: "muszę iść do domu."},
    {it: "amo studiare la lingua.", pl: "uwielbiam uczyć się języka."},
    {it: "posso aiutarti con il lavoro.", pl: "mogę pomóc ci z pracą."},
    {it: "preferisco bere il tè.", pl: "wolę pić herbatę."}
  ];
  const timeExpressions = [
    {it: "oggi", pl: "dzisiaj"},
    {it: "domani", pl: "jutro"},
    {it: "sempre", pl: "zawsze"},
    {it: "spesso", pl: "często"}
  ];
  
  let sentIdx = 1;
  for(let sub of subjects) {
    for(let vo of verbsAndObjects) {
       for(let time of timeExpressions) {
          database.push({
             id: `gen-sent-${sentIdx++}`,
             italian: `${sub.it} ${time.it} ${vo.it}`,
             polish: `${sub.pl} ${time.pl} ${vo.pl}`,
             type: "sentence",
             level: "A2 - Rozbudowane Konstrukcje Zdaniowe"
          });
       }
    }
  }

  const existingFile = './src/data/vocabulary.json';
  let existingData = [];
  if (fs.existsSync(existingFile)) {
    existingData = JSON.parse(fs.readFileSync(existingFile));
  }
  
  const fullData = [...existingData, ...database];
  fs.writeFileSync(existingFile, JSON.stringify(fullData, null, 2));
  console.log(`\nSukces! Baza flashcards została powiększona i teraz liczy: ${fullData.length} rekordów!`);
}

run();
