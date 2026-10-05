// Copies the runtime files of a built extension into <out>/<id>/, ready to zip.
// Mirrors the panel's `p:extension:pack`: the manifest, routes, database, resources,
// dist, vendor and the autoloaded source directories - no dotfiles, node_modules or tests.
// Usage: node scripts/stage.mjs <extension-folder> <out-directory>
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? '');
const out = path.resolve(process.argv[3] ?? 'out');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'extension.json'), 'utf8'));
const target = path.join(out, manifest.id);

const SKIPPED = new Set(['node_modules', 'tests', 'test', 'coverage']);
const directories = [...new Set(['routes', 'database', 'resources', 'dist', 'vendor', ...Object.values(manifest.autoload ?? {})])];

const copy = (from, to) => {
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || SKIPPED.has(entry.name) || entry.isSymbolicLink()) continue;
        const source = path.join(from, entry.name);
        const destination = path.join(to, entry.name);
        if (entry.isDirectory()) {
            copy(source, destination);
        } else {
            fs.mkdirSync(to, { recursive: true });
            fs.copyFileSync(source, destination);
        }
    }
};

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });
fs.copyFileSync(path.join(dir, 'extension.json'), path.join(target, 'extension.json'));
for (const name of ['README.md', 'LICENSE', 'LICENSE.md']) {
    if (fs.existsSync(path.join(dir, name))) fs.copyFileSync(path.join(dir, name), path.join(target, name));
}
for (const directory of directories) {
    const source = path.join(dir, directory);
    if (fs.existsSync(source)) copy(source, path.join(target, directory));
}

console.log(`${manifest.id} ${manifest.version} staged in ${path.relative(process.cwd(), target)}`);
