const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        const replacements = [
            { from: /src="assets\//g, to: 'src="/assets/' },
            { from: /thumb: "assets\//g, to: 'thumb: "/assets/' },
            { from: /icon: "assets\//g, to: 'icon: "/assets/' },
            { from: /icon_2: "assets\//g, to: 'icon_2: "/assets/' },
            { from: /return "assets\//g, to: 'return "/assets/' }
        ];

        replacements.forEach(({from, to}) => {
            if (content.match(from)) {
                content = content.replace(from, to);
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed:', filePath);
        }
    }
});
