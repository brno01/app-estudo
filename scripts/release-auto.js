// scripts/release-auto.js
const { execSync } = require('child_process');
const readline = require('readline-sync');

// Pergunta o tipo de release (patch, minor, major)
const type = readline.question('Tipo de release (patch/minor/major) [patch]: ') || 'patch';

// Pergunta a mensagem extra do commit
const msg = readline.question('Mensagem do commit: ');

// Verifica se o diretório está limpo
const status = execSync('git status --porcelain').toString();
if (status) {
    console.log('Diretório git não está limpo. Commit ou stash suas alterações antes.');
    process.exit(1);
}

// Roda o versionamento com a mensagem customizada
execSync(`npm version ${type} -m "chore(release): versão %s (${msg})"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
execSync('git push --tags', { stdio: 'inherit' });

console.log('Release finalizado com sucesso!');