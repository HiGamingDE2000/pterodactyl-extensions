// Checks one built extension the way the panel does before it accepts a package.
// Usage: node scripts/check.mjs <extension-folder>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const dir = path.resolve(process.argv[2] ?? '');
const folder = path.basename(dir);
const errors = [];

const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'extension.json'), 'utf8'));
if (manifest.id !== folder) errors.push(`extension.json id "${manifest.id}" must match the folder name "${folder}"`);
if (!/^\d+\.\d+\.\d+/.test(manifest.version ?? '')) errors.push('extension.json needs a semantic version');

const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
if (pkg.version !== manifest.version) errors.push(`package.json version ${pkg.version} differs from extension.json ${manifest.version}`);

if (manifest.ui?.entry && !fs.existsSync(path.join(dir, manifest.ui.entry))) {
    errors.push(`${manifest.ui.entry} is missing - run the build first`);
}

if (manifest.provider) {
    const [namespace, ...rest] = manifest.provider.split('\\');
    const source = manifest.autoload?.[`${namespace}\\`];
    if (!source || !fs.existsSync(path.join(dir, source, `${rest.join('/')}.php`))) {
        errors.push(`provider ${manifest.provider} has no matching file under autoload`);
    }
}

if (!fs.existsSync(path.join(dir, 'README.md'))) errors.push('README.md is missing');

// Extension stylesheets load after the panel's and beside every other extension's, so
// Tailwind utilities must carry this extension's own prefix (ui.prefix in the manifest)
// and theme variables the matching `--<prefix>-`, or they override somebody else's.
const prefix = manifest.ui?.prefix;
const dist = path.join(dir, 'dist');
const stylesheets = fs.existsSync(dist) ? fs.readdirSync(dist).filter((name) => name.endsWith('.css')) : [];
for (const name of stylesheets) {
    const css = fs.readFileSync(path.join(dist, name), 'utf8');
    if (!/@layer\s+(utilities|theme)\b/.test(css)) continue;

    if (!/^[a-z]{2,12}$/.test(prefix ?? '')) {
        errors.push('extension.json needs ui.prefix (2-12 lowercase letters) because it ships Tailwind styles');
        continue;
    }

    let postcss;
    try {
        postcss = createRequire(path.join(dir, 'package.json'))('postcss');
    } catch {
        errors.push(`dist/${name} uses Tailwind layers but postcss is not installed to verify them`);
        continue;
    }

    postcss.parse(css).walkAtRules('layer', (layer) => {
        const layerName = layer.params.trim();
        if (layerName === 'utilities') {
            layer.walkRules((rule) => {
                if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
                if (!rule.selector.includes(`.${prefix}\\:`)) {
                    errors.push(`dist/${name}: utility "${rule.selector.slice(0, 60)}" does not use the ${prefix}: prefix`);
                }
            });
        }
        if (layerName === 'theme') {
            layer.walkDecls(/^--/, (decl) => {
                if (!decl.prop.startsWith(`--${prefix}-`)) {
                    errors.push(`dist/${name}: theme variable ${decl.prop} does not use the --${prefix}- prefix`);
                }
            });
        }
    });
}

if (errors.length > 0) {
    console.error(`${folder}: ${errors.length} problem(s)`);
    for (const error of [...new Set(errors)].slice(0, 20)) console.error(`  - ${error}`);
    process.exit(1);
}

console.log(`${folder}: ok (v${manifest.version})`);
