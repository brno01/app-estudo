# app-estudo

[![ci](https://github.com/brno01/app-estudo/actions/workflows/ci.yml/badge.svg)](https://github.com/brno01/app-estudo/actions/workflows/ci.yml)
[![security](https://github.com/brno01/app-estudo/actions/workflows/security.yml/badge.svg)](https://github.com/brno01/app-estudo/actions/workflows/security.yml)
[![licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

Projeto de estudo: o começo de uma API REST com Node.js e Express 5.

## Estado
Incompleto e parado. Hoje o repositório tem só o esqueleto:

- `server.js` cria o servidor HTTP na porta `PORT` (padrão 4000).
- `app.js` monta o Express, com uma rota de produtos em `/api/v1/products` e uma resposta genérica em `/api/v1`.

O `app.js` importa `./router/api/v1/product`, que ainda não existe no repositório, então **a aplicação não inicia** como está. Os scripts `start` e `release` do `package.json` também apontam para arquivos que não existem (`index.js` e `scripts/release.js`).

## Requisitos e instalação
- Node.js 20 ou mais novo.

```bash
npm ci
```

## Uso
Quando a rota de produtos existir, o servidor sobe com:

```bash
node server.js
```

## Verificações e CI
Não há testes. A única checagem local é a de sintaxe:

```bash
node --check app.js && node --check server.js
```

No GitHub, todo PR e todo push na `master` rodam dois workflows:
- `ci`: instala as dependências e roda a checagem de sintaxe.
- `security`: segredos, dependências vulneráveis, análise estática e os próprios workflows. Uma falha na `master` abre uma issue `security-scan`.

O `claude` é o revisor sob demanda: comentar `@claude` num PR ou numa issue, ou rodar o workflow à mão para uma auditoria que abre issues. Só o dono do repositório consegue acioná-lo.

## Estrutura
- `server.js`: ponto de entrada.
- `app.js`: aplicação Express e rotas.
- `package.json`, `package-lock.json`: dependências (só o Express).

## Segurança
Relate vulnerabilidades pela aba **Security** (**Report a vulnerability**), não por issue pública.

## Licença
[MIT](LICENSE)
