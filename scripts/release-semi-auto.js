const { execSync } = require('child_process');
const readline = require('readline-sync');

// Mapa de abreviações para tipos de release
const typeMap = {
    p: 'patch',
    patch: 'patch',
    m: 'minor',
    minor: 'minor',
    M: 'major',
    major: 'major'
};

// Pergunta o tipo de release
let typeInput = readline.question('Tipo de release (patch/p, minor/m, major/M) [patch]: ') || 'patch';
typeInput = typeMap[typeInput] || 'patch';

// Pergunta a mensagem extra do commit
const msg = readline.question('Mensagem do commit: ');

// Verifica se há alterações não commitadas
const status = execSync('git status --porcelain').toString();
if (!status) {
    console.log('✅ Nenhuma alteração detectada. A versão não será alterada.');
    process.exit(0);
}

// Apenas verifica se o diretório está limpo
if (status) {
    console.log('\n⚠️ Diretório git não está limpo. Commit ou stash suas alterações antes de rodar o release.\n');
    process.exit(1);
}

// Roda o versionamento com mensagem customizada
execSync(`npm version ${typeInput} -m "chore(release): versão %s (${msg})"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
execSync('git push --tags', { stdio: 'inherit' });

console.log('Release finalizado com sucesso! ✅ (Interativo e Sem stash)');