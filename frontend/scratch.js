const fs = require('fs');
const file = 'src/navigation/Navigation.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace all page imports with React.lazy
content = content.replace(/import ([a-zA-Z0-9_]+) from '\.\.\/pages\/([a-zA-Z0-9_]+)';/g, "const $1 = React.lazy(() => import('../pages/$2'));");

// Add React import if missing
if (!content.includes('import React')) {
    content = "import React, { Suspense } from 'react';\n" + content;
} else if (!content.includes('Suspense')) {
    content = content.replace("import React", "import React, { Suspense }");
}

// Wrap Routes with Suspense
content = content.replace("<Routes>", "<Suspense fallback={<div className=\"preloader-lazy\" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>\n      <Routes>");
content = content.replace("</Routes>", "</Routes>\n    </Suspense>");

fs.writeFileSync(file, content);
console.log("Done");
