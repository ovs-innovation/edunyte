import re

file_path = 'src/navigation/Navigation.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace page imports with lazy imports
content = re.sub(r"import ([a-zA-Z0-9_]+) from '\.\.\/pages\/([a-zA-Z0-9_]+)';", r"const \1 = React.lazy(() => import('../pages/\2'));", content)

# Add React import
if "import React" not in content:
    content = "import React, { Suspense } from 'react';\n" + content
elif "Suspense" not in content:
    content = content.replace("import React", "import React, { Suspense }")

# Add Suspense wrapper
content = content.replace("<Routes>", "<Suspense fallback={<div className=\"preloader\" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>\n      <Routes>")
content = content.replace("</Routes>", "</Routes>\n    </Suspense>")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
