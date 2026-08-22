import os, glob, re

pages = glob.glob('frontend/src/pages/*.tsx') + glob.glob('frontend/src/components/**/*.tsx', recursive=True)

for p in pages:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'useNoteStore' not in content and 'noteStore' not in content:
        continue
        
    print('Refactoring', p)
    
    # 1. Imports
    content = re.sub(r"import \{ useNoteStore \} from '[^']*noteStore';", "import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';\nimport type { Note } from '@/types/notes';", content)
    
    # 2. Hook calls
    content = re.sub(r'const notes = useNoteStore\(\(s\) => s\.notes\);', 'const { data: notes = [] } = useNotes();', content)
    content = re.sub(r'const createNote = useNoteStore\(\(s\) => s\.createNote\);', 'const createNote = useCreateNote();', content)
    content = re.sub(r'const updateNote = useNoteStore\(\(s\) => s\.updateNote\);', 'const updateNote = useUpdateNote();', content)
    content = re.sub(r'const deleteNote = useNoteStore\(\(s\) => s\.deleteNote\);', 'const deleteNote = useDeleteNote();', content)
    content = re.sub(r'const toggleFavorite = useNoteStore\(\(s\) => s\.toggleFavorite\);', 'const toggleFavorite = useToggleFavoriteNote();', content)
    content = re.sub(r'const initialize = useNoteStore\(\(s\) => s\.initialize\);', '', content)
    
    # 3. Usage
    content = re.sub(r'createNote\(\)', "createNote.mutateAsync({ title: 'Untitled', content: '', folder: 'Inbox' }).then(n => n.id)", content)
    content = re.sub(r'toggleFavorite\((.*?)\)', r'toggleFavorite.mutate(\1)', content)
    content = re.sub(r'deleteNote\((.*?)\)', r'deleteNote.mutate(\1)', content)
    
    # updateNote is trickier: updateNote(id, { title, content }) -> updateNote.mutate({ id, payload: { title, content } })
    content = re.sub(r'updateNote\(([^,]+),\s*(\{[^}]+\})\)', r'updateNote.mutate({ id: \1, payload: \2 })', content)
    
    # timestamps: n.updatedAt is now string (ISO), formatRelativeTime needs Date
    content = re.sub(r'formatRelativeTime\(n\.updatedAt\)', 'formatRelativeTime(new Date(n.updatedAt).getTime())', content)
    content = re.sub(r'b\.updatedAt \- a\.updatedAt', 'new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()', content)
    content = re.sub(r'b\.timestamp \- a\.timestamp', 'new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()', content)

    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
