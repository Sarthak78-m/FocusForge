import os, glob

pages = glob.glob('frontend/src/pages/*.tsx') + glob.glob('frontend/src/components/**/*.tsx', recursive=True)

for p in pages:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'new Date(' in content:
        content = content.replace('formatRelativeTime(new Date(n.updatedAt).getTime())', 'formatRelativeTime(n.updatedAt)')
        content = content.replace('formatRelativeTime(new Date(note.updatedAt).getTime())', 'formatRelativeTime(note.updatedAt)')
        content = content.replace('formatDate(new Date(note.updatedAt).getTime())', 'formatDate(note.updatedAt)')
        content = content.replace('formatDate(new Date(n.updatedAt).getTime())', 'formatDate(n.updatedAt)')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(content)
