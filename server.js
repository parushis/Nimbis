const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const POSTS_DIR = path.join(__dirname, 'posts');

async function getPosts() {
  const files = await fs.readdir(POSTS_DIR);
  const posts = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
    const { data } = matter(raw);
    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || null,
      description: data.description || ''
    });
  }
  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });
  return posts;
}

async function getPost(slug) {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, 'utf8');
  const { data, content } = matter(raw);
  const html = sanitizeHtml(marked.parse(content));
  return { slug, meta: data, contentHtml: html };
}

app.get('/', async (req, res) => {
  try {
    const posts = await getPosts();
    res.render('index', { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const post = await getPost(slug);
    res.render('post', { post });
  } catch (err) {
    res.status(404).render('404', { slug });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
