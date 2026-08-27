# 👾 Kanban Corporativo (Retro Edition)

Um sistema de gestão de tarefas Fullstack focado em produtividade corporativa, construído com uma arquitetura de banco de dados relacional e estilizado com uma interface Retro/Pixel Art imersiva.

## 🚀 Funcionalidades

*   **Gestão de Tarefas (CRUD):** Criação, edição, exclusão e movimentação de tarefas entre colunas (A Fazer, Em Progresso, Concluídas).
*   **Arquitetura Relacional:** Relacionamento estruturado entre Tarefas, Usuários e Equipes utilizando chaves estrangeiras (Foreign Keys).
*   **Filtros Dinâmicos:** Busca filtrada por Equipes e Responsáveis implementada diretamente na API via Query Parameters.
*   **UI/UX Personalizada:** Interface responsiva construída do zero com Tailwind CSS, apresentando um design "Retro 8-bits" com modais dinâmicos e validação de formulários.
*   **Database Seeding:** População automática de times e usuários de teste ao iniciar a aplicação pela primeira vez.

## 🛠️ Tecnologias Utilizadas

### Backend
*   **Linguagem:** Go (Golang)
*   **Framework Web:** Gin
*   **ORM:** GORM
*   **Banco de Dados:** PostgreSQL

### Frontend
*   **Biblioteca:** React (via Vite)
*   **Estilização:** Tailwind CSS + Google Fonts (VT323)

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Go](https://golang.org/) instalado.
*   [Node.js](https://nodejs.org/) instalado.
*   [PostgreSQL](https://www.postgresql.org/) rodando localmente (Porta 5432).

### 1. Configurando o Banco de Dados e Backend
Abra o terminal, navegue até a pasta `backend` e inicie o servidor. O GORM criará as tabelas e inserirá os dados iniciais automaticamente.

```bash
cd backend
go mod tidy
go run main.go