import os, re
p = 'frontend/src/pages/RecentPage.tsx'
with open(p, 'r', encoding='utf-8') as f: content = f.read()
content = content.replace("toggleFavorite.mutate(n.id)", "toggleFavorite.mutate(Number(n.id))")
with open(p, 'w', encoding='utf-8') as f: f.write(content)
