import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const ignoreDirs = new Set(['.git', 'node_modules', 'dist']);
const textExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.toml', '.css', '.html', '.yml', '.yaml', '.mjs', '.cjs']);

const offenders = [];
const conflictMarkerPattern = /^<<<<<<< .*[\r\n]+[\s\S]*?^=======\s*$[\s\S]*?^>>>>>>> .*/m;

const shouldScanFile = (name) => {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  return textExts.has(name.slice(dot));
};

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const relPath = fullPath.slice(root.length + 1);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.has(entry)) walk(fullPath);
      continue;
    }

    if (!shouldScanFile(entry)) continue;

    const text = readFileSync(fullPath, 'utf8');
    if (conflictMarkerPattern.test(text)) {
      offenders.push(relPath);
    }
  }
};

walk(root);

if (offenders.length > 0) {
  console.error('Unresolved merge conflict markers found in:');
  for (const file of offenders) console.error(`- ${file}`);
  process.exit(1);
}

console.log('No unresolved merge conflict markers found.');
