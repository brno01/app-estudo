const { execSync } = require('child_process');
const readline = require('readline-sync');

// Pergunta o tipo de release
const type = readline.question('Tipo de release (patch/minor/major) [patch]: ') || 'patch';

// Pergunta a mensagem extra do commit
const msg = readline.question('Mensagem do commit: ');

let hadStash = false;

// Verifica se há alterações não commitadas
const status = execSync('git status --porcelain').toString();
if (status) {
    console.log('Alterações não commitadas detectadas. Criando stash temporário...');
    execSync('git stash push -m "stash antes do release-auto"', { stdio: 'inherit' });
    hadStash = true;
}

// Roda o versionamento com mensagem customizada
execSync(`npm version ${type} -m "chore(release): versão %s (${msg})"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
execSync('git push --tags', { stdio: 'inherit' });

console.log('Release finalizado com sucesso!');

// Restaura o stash se havia alterações
if (hadStash) {
    console.log('Restaurando alterações stashadas...');
    execSync('git stash pop', { stdio: 'inherit' });
}