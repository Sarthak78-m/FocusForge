import os, re
p = 'frontend/src/layouts/TodoistSidebar.tsx'
with open(p, 'r', encoding='utf-8') as f: content = f.read()
content = content.replace("import { useNoteStore } from '@/store/noteStore';", "import { useNotes } from '@/hooks/useNotes';\nimport type { Note } from '@/types/notes';")
content = content.replace("const notes = useNoteStore((s) => s.notes);", "const { data: notes = [] } = useNotes();\n  const typedNotes: Note[] = notes;")
content = content.replace("notes.filter", "typedNotes.filter")
content = content.replace("notes.flatMap", "typedNotes.flatMap")
with open(p, 'w', encoding='utf-8') as f: f.write(content)
