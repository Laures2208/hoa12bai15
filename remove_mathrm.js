import fs from 'fs';

const filePath = 'src/data/questionBank.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace \mathrm{X} with X
content = content.replace(/\\mathrm\{([^}]+)\}/g, '$1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced \\mathrm{...} with ... in questionBank.ts');
