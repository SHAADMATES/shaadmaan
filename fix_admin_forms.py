import os
import re

files_to_update = [
    'admin/Schedule.jsx',
    'admin/AddResults.jsx',
    'admin/Settings.jsx',
    'admin/ManagePrograms.jsx'
]

base_dir = r'c:\Users\STUDENT\Downloads\shaad mates\client\src\pages'

for file in files_to_update:
    path = os.path.join(base_dir, file)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = re.sub(r'className="([^"]*)text-xs font-semibold text-slate-500([^"]*)"', r'className="form-label \1 \2"', content)
    content = content.replace('className="text-xs font-semibold text-slate-500"', 'className="form-label"')
    
    content = re.sub(r'className="w-full px-3\.5 py-2\.5?[^"]*"', 'className="form-input"', content)
    content = re.sub(r'className="w-full px-4 py-3[^"]*"', 'className="form-input"', content)
    content = re.sub(r'className="w-full pl-9 pr-4 py-2\.5[^"]*"', 'className="form-input pl-9"', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print('Updated remaining admin forms.')
