#!/usr/bin/env node
const { execSync } = require("child_process");

// Pega argumentos: level (patch/minor/major) e comentário
const [, , level, ...msgParts] = process.argv;

if (!level) {
    console.error("Uso: node scripts/release.js <patch|minor|major> \"mensagem opcional\"");
    process.exit(1);
}

const message = msgParts.length > 0
    ? `chore(release): versão %s - ${msgParts.join(" ")}`
    : `chore(release): versão %s (${level})`;

try {
    execSync(`npm version ${level} -m "${message}"`, { stdio: "inherit" });
    execSync("git push && git push --tags", { stdio: "inherit" });
} catch (err) {
    process.exit(1);
}
