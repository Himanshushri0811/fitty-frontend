const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds & Surfaces
  { regex: /#000000|#000|#020617|#070b14/gi, replacement: 'var(--fitty-bg)' },
  { regex: /#0f172a|#1a1a2e|#0d1220/gi, replacement: 'var(--fitty-bg-secondary)' },
  { regex: /#111827|#1e1e24|#1a202c/gi, replacement: 'var(--fitty-surface)' },
  { regex: /#151d2e|#2d3748/gi, replacement: 'var(--fitty-surface-elevated)' },
  
  // Text
  { regex: /#ffffff|#fff|#f8fafc/gi, replacement: 'var(--fitty-text)' },
  { regex: /#cbd5e1|#eee|#dddddd|#d1d5db/gi, replacement: 'var(--fitty-text-secondary)' },
  { regex: /#94a3b8|#9ca3af|#64748b/gi, replacement: 'var(--fitty-text-muted)' },
  { regex: /#475569/gi, replacement: 'var(--fitty-text-disabled)' },
  
  // Borders
  { regex: /#1e293b|#333333|#333|#222222|#222|#444444|#444|#e5e7eb/gi, replacement: 'var(--fitty-border)' },
  
  // Brand
  { regex: /#8B5CF6|#6366f1|#818cf8|#c084fc/gi, replacement: 'var(--fitty-primary)' },
  { regex: /#7C3AED/gi, replacement: 'var(--fitty-primary-hover)' },
  { regex: /#A855F7/gi, replacement: 'var(--fitty-secondary)' },
  { regex: /#EC4899|#f472b6|#fb7185|#f43f5e/gi, replacement: 'var(--fitty-accent)' },
  
  // Semantic
  { regex: /#22C55E|#10b981/gi, replacement: 'var(--fitty-success)' },
  { regex: /#F59E0B/gi, replacement: 'var(--fitty-warning)' },
  { regex: /#EF4444/gi, replacement: 'var(--fitty-error)' },
  { regex: /#38BDF8|#06b6d4|#22d3ee/gi, replacement: 'var(--fitty-info)' }
];

function replaceInFile(filePath) {
  if (filePath.endsWith('index.css')) return; // Skip base variables
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  replacements.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('d:/demo_project/FITMITRA/frontent/src');
