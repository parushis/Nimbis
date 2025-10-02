const fs = require('fs').promises;
const path = require('path');

const title = process.argv[2];
const slugArg = process.argv[3];

if (!title) {
  console.log('Usage: node new-post.js "My Title" [slug]');
  process.exit(1);
}

const slug = slugArg || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const filename = path.join(__dirname, 'posts', `${slug}.md`);
const content = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().slice(0,10)}"
description: ""
---

Write your content here in Markdown.

- Bullet points
- Code blocks
`;

(async () => {
  await fs.mkdir(path.join(__dirname, 'posts'), { recursive: true });
  await fs.writeFile(filename, content, 'utf8');
  console.log('Created', filename);
})();
