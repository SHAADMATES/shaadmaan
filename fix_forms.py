import os
import re

files_to_update = [
    'ChangePassword.jsx',
    'admin/ManageStudents.jsx',
    'admin/ManageOutreach.jsx',
    'manager/AddProgram.jsx',
    'superadmin/ManageUsers.jsx',
    'admin/Wings.jsx',
    'admin/FormsManagement.jsx'
]

base_dir = r'c:\Users\STUDENT\Downloads\shaad mates\client\src\pages'

for file in files_to_update:
    path = os.path.join(base_dir, file)
    if not os.path.exists(path):
        print(f"Skipping {file} - not found")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace labels (capturing any inner classes like flex if they exist)
    content = re.sub(r'className="([^"]*text-xs font-semibold text-slate-500[^"]*)"', r'className="form-label \1"', content)
    # cleanup repetitive classes if they got merged
    content = content.replace('text-xs font-semibold text-slate-500', '')
    
    # Replace inputs
    content = re.sub(r'className="w-full px-3\.5 py-2\.5?[^"]*"', 'className="form-input"', content)
    content = re.sub(r'className="w-full px-4 py-3[^"]*"', 'className="form-input"', content)
    
    # Replace search inputs
    content = re.sub(r'className="w-full pl-9 pr-4 py-2\.5[^"]*"', 'className="form-input pl-9"', content)
    content = re.sub(r'className="pl-9 pr-4 py-2\.5[^"]*"', 'className="form-input pl-9"', content)
    
    # Buttons
    content = re.sub(r'className="w-full py-3 rounded-2xl text-white font-bold[^"]*"', 'className="form-submit-btn"', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated all forms.")
