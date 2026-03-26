import fs from 'fs';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace simple formulas like $Fe_2O_3$
  content = content.replace(/\$([A-Z][A-Za-z0-9_()]*)\$/g, '$\\mathrm{$1}$');
  
  fs.writeFileSync(filePath, content);
}

processFile('src/data/questionBank.ts');
processFile('src/App.tsx');
processFile('src/document.ts');
processFile('src/constants.ts');
