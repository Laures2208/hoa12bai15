import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the EXERCISES section
const exercisesStart = content.indexOf('const EXERCISES = {');
const exercisesEnd = content.indexOf('};', exercisesStart) + 2;

if (exercisesStart !== -1 && exercisesEnd !== -1) {
  let exercisesContent = content.substring(exercisesStart, exercisesEnd);
  
  // Replace \mathrm{X} and \\mathrm{X} with X
  exercisesContent = exercisesContent.replace(/\\\\?mathrm\{([^}]+)\}/g, '$1');
  
  content = content.substring(0, exercisesStart) + exercisesContent + content.substring(exercisesEnd);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced mathrm in EXERCISES section of App.tsx');
} else {
  console.log('Could not find EXERCISES section');
}
