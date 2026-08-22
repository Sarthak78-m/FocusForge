import os, re
p = 'frontend/src/components/Layout/TopHeader.tsx'
with open(p, 'r', encoding='utf-8') as f: content = f.read()

content = re.sub(r'const ACTIVITY_ICONS.*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'\{recentActivity\.length > 0 && \(\n\s*<span className="pointer-events-none absolute top-1 right-1.*?\n\s*\)\}', '', content, flags=re.DOTALL)
content = re.sub(r'\{bellOpen && \(\n\s*<div className="absolute top-full right-0.*?\n\s*\)\}', '', content, flags=re.DOTALL)

with open(p, 'w', encoding='utf-8') as f: f.write(content)
