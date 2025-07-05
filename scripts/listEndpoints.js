// scripts/listEndpoints.js
// Scans project files for network endpoints and outputs a JSON registry

import fs from 'fs';
import path from 'path';

// Recursively read directory
function walk(dir) {
  let files = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (/\.(js|ts|tsx)$/.test(fullPath)) {
      files.push(fullPath);
    }
  });
  return files;
}

// Regex to match HTTP/HTTPS URLs in code
const urlRegex = /["'`](https?:\/\/[\w\-./?=&%:#]+)["'`]/g;
const projectRoot = path.resolve(__dirname, '..');
const codeFiles = walk(projectRoot);
const endpoints = {};

codeFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    if (!endpoints[url]) endpoints[url] = [];
    endpoints[url].push(path.relative(projectRoot, file));
  }
});

const output = Object.entries(endpoints).map(([url, files]) => ({ url, files }));
fs.writeFileSync(
  path.join(projectRoot, 'config', 'apiEndpoints.json'),
  JSON.stringify(output, null, 2)
);
console.log('Discovered endpoints:', output.length);
