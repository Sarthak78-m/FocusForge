import os
import re

# TopHeader
p1 = 'frontend/src/components/Layout/TopHeader.tsx'
with open(p1, 'r', encoding='utf-8') as f: c1 = f.read()
c1 = c1.replace("navigate(/notes/);", "navigate(/notes/);")
with open(p1, 'w', encoding='utf-8') as f: f.write(c1)

# RecentPage
p2 = 'frontend/src/pages/RecentPage.tsx'
with open(p2, 'r', encoding='utf-8') as f: c2 = f.read()
c2 = re.sub(r'toggleFavorite\.mutate\((n\.id)\)', r'toggleFavorite.mutate(Number(\1))', c2)
with open(p2, 'w', encoding='utf-8') as f: f.write(c2)

