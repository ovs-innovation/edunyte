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
            { from: /image: "assets\//g, to: 'image: "/assets/' },
            { from: /bg_img: "assets\//g, to: 'bg_img: "/assets/' },
            { from: /bg_image: "assets\//g, to: 'bg_image: "/assets/' },
            { from: /img: "assets\//g, to: 'img: "/assets/' }
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
