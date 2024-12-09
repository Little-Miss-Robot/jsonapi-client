import fs from 'node:fs';
import path from 'node:path';

function addJsExtensionToImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            addJsExtensionToImports(filePath);
        }
        else if (filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Match imports that don't have an extension
            content = content.replace(/(import\s+(?:\S.*?)??from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, (match, p1, p2, p3) => {
                if (!p2.endsWith('.js') && !p2.endsWith('.json')) {
                    return `${p1}${p2}.js${p3}`;
                }
                return match;
            });

            fs.writeFileSync(filePath, content);
        }
    }
}

addJsExtensionToImports('./dist');
