const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('lib/ai/openrouter')) {
        content = content.replace(/lib\/ai\/openrouter/g, 'lib/ai/gemini');
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(process.cwd(), 'app'));
replaceInDir(path.join(process.cwd(), 'lib'));
replaceInDir(path.join(process.cwd(), 'components'));
