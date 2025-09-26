# Sistema de Gestão de Assinaturas

Este é um sistema de gestão de assinaturas onde os usuários podem visualizar e gerenciar suas assinaturas, criar novas assinaturas, editar assinaturas existentes, cancelar e excluir assinaturas. O sistema também oferece um histórico de faturas, onde os usuários podem verificar o status e detalhes das suas faturas e, se necessário, baixar a nota fiscal em PDF.

## Funcionalidades

### 1. Gerenciamento de Assinaturas
- **Adicionar nova assinatura**: Permite ao usuário criar uma nova assinatura, especificando o plano, preço e data de cobrança.
- **Editar assinatura**: O usuário pode modificar as informações de uma assinatura existente, como plano, preço e data de cobrança.
- **Cancelar assinatura**: O usuário pode cancelar uma assinatura ativa.
- **Excluir assinatura**: O usuário pode excluir uma assinatura do sistema.

### 2. Histórico de Faturas
- **Visualizar histórico de faturas**: O usuário pode ver um histórico completo das faturas geradas.
- **Baixar PDF da fatura**: O usuário pode baixar a nota fiscal em formato PDF para cada fatura.

## Tecnologias Utilizadas

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - Lucide Icons

- **Backend** (simulado localmente):
  - API de exemplo para integração com banco de dados MongoDB

## Como Rodar o Projeto

### Requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Acesso a um banco de dados MongoDB (simulado no exemplo, mas pode ser integrado com um banco real)

### Instalação

1. Clone este repositório:

```bash
git clone https://github.com/seu-usuario/sistema-gestao-assinaturas.git
cd sistema-gestao-assinaturas
