const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'assets', 'data', 'gate_sy_2026.json');
const gateDir = path.join(rootDir, 'gate-syllabus');

const subjects = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const gateEntries = fs
    .readdirSync(gateDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

const findDirForCode = (code) => {
    const lower = code.toLowerCase();
    return gateEntries.find((entry) => entry.name.startsWith(`${lower}-`));
};

let updated = 0;
const missing = [];
const warnings = [];

subjects.forEach((subject) => {
    const code = (subject['Subject Name'] || '').trim();
    const driveLink = (subject['Drive Link'] || '').trim();
    if (!code || !driveLink) {
        warnings.push(`Skipping entry with missing fields: ${JSON.stringify(subject)}`);
        return;
    }

    const dirEntry = findDirForCode(code);
    if (!dirEntry) {
        missing.push(code);
        return;
    }

    const filePath = path.join(gateDir, dirEntry.name, 'index.html');
    if (!fs.existsSync(filePath)) {
        missing.push(`${code} (no index.html)`);
        return;
    }

    const idMatch = driveLink.match(/\/d\/([^/]+)\//);
    if (!idMatch) {
        warnings.push(`Could not extract file id for ${code} from ${driveLink}`);
        return;
    }

    const fileId = idMatch[1];
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    let content = fs.readFileSync(filePath, 'utf-8');
    let viewUpdated = false;
    let downloadUpdated = false;

    content = content.replace(/https:\/\/drive\.google\.com\/file\/d\/[^"']+/g, (match) => {
        if (viewUpdated) return match;
        viewUpdated = true;
        return driveLink;
    });

    content = content.replace(/https:\/\/drive\.google\.com\/uc\?export=download&id=[^"']+/g, (match) => {
        if (downloadUpdated) return match;
        downloadUpdated = true;
        return downloadLink;
    });

    if (!viewUpdated || !downloadUpdated) {
        warnings.push(`Links not updated for ${code}, viewUpdated=${viewUpdated}, downloadUpdated=${downloadUpdated}`);
        return;
    }

    fs.writeFileSync(filePath, content);
    updated += 1;
});

console.log(`Updated ${updated} subject pages.`);
if (missing.length) {
    console.warn('Missing subjects:', missing.join(', '));
}
if (warnings.length) {
    console.warn('Warnings:');
    warnings.forEach((w) => console.warn(` - ${w}`));
}
