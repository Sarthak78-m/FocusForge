import os, glob, re
pages = glob.glob('frontend/src/pages/*.tsx') + glob.glob('frontend/src/components/**/*.tsx', recursive=True) + glob.glob('frontend/src/layouts/**/*.tsx', recursive=True)
for p in pages:
    with open(p, 'r', encoding='utf-8') as f: content = f.read()
    if 'useParams' in content:
        content = re.sub(r'n\.id === id', 'n.id === Number(id)', content)
        content = re.sub(r'updateNote\.mutate\(\{ id: id,', 'updateNote.mutate({ id: Number(id),', content)
        content = re.sub(r'updateNote\.mutate\(\{ id,\s*payload:', 'updateNote.mutate({ id: Number(id), payload:', content)
        content = re.sub(r'deleteNote\.mutate\(id\)', 'deleteNote.mutate(Number(id))', content)
    with open(p, 'w', encoding='utf-8') as f: f.write(content)
