const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceAPI(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceAPI(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('const API = import.meta.env.VITE_API_URL;')) {
                content = content.replace(/const API = import\.meta\.env\.VITE_API_URL;/g, "const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';");
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}
replaceAPI(srcDir);
