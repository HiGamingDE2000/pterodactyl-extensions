// Prints the extension folders in this repository (those with an extension.json)
// as a JSON array, for the CI build matrix.
import fs from 'node:fs';

export function extensions(root = '.') {
    return fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .filter((entry) => fs.existsSync(`${root}/${entry.name}/extension.json`))
        .map((entry) => entry.name)
        .sort();
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('extensions.mjs')) {
    console.log(JSON.stringify(extensions()));
}
