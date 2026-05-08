# MyClub - Sistema de Gestão

O **MyClub** é uma aplicação Full Stack projetada para auxiliar instrutores e professores particulares na gestão de alunos e no controle financeiro de seus negócios. O projeto nasceu de um desafio real durante o curso de **Análise e Desenvolvimento de Sistemas**, onde, em contato com um instrutor de treinamento funcional, busquei entender e solucionar suas dores operacionais.

A solução centraliza o gerenciamento de alunos com matrículas em diferentes planos, o controle de pagamentos de mensalidades e o monitoramento de despesas, fornecendo uma visão clara do fluxo de caixa e do resultado financeiro mensal.

### Tecnologias Utilizadas

A execução deste projeto consolidou a aplicação prática da **stack tecnológica** na qual venho me aprofundando. O ecossistema **JavaScript** foi utilizado tanto no backend quanto no frontend, com o **TypeScript** garantindo segurança e robustez ao código-base.

A utilização do **TypeScript** permitiu a detecção de erros ainda em tempo de desenvolvimento através da tipagem estática (Type Safety), além de resultar em um código muito mais legível e com documentação técnica mais clara.

- **Backend:** Foi estruturada uma API com **Node.js** e **Express**, integrada ao banco de dados **MySQL** através do **Sequelize**, garantindo uma persistência de dados eficiente e segura.
- **Frontend:** O foco foi o desenvolvimento de uma interface moderna, modular e totalmente responsiva, utilizando **React (Vite)**, **Tailwind CSS** e **Shadcn UI** para proporcionar uma experiência de usuário fluida e intuitiva.

#### **Detalhes Técnicos Backend**

- **Node.js com Express** (Arquitetura REST)
- **TypeScript** para tipagem estática e prevenção de erros
- **Sequelize ORM** (Modelagem e abstração de banco de dados relacional)
- **MySQL** (Persistência de dados segura)
- **JWT** para autenticação e autorização

#### **Detalhes Técnicos Frontend**

- **React (Vite)** com **TypeScript**
- **Tailwind CSS & Shadcn UI** para componentização moderna e design responsivo
- **Axios** para o consumo da API de forma otimizada
- **React Router Dom** para o gerenciamento de rotas

### Arquitetura

- **Monorepo:** Organização centralizada e eficiente entre as pastas de `backend` e `frontend`.
- **Segurança:** Implementação de políticas de **CORS**, tratamento de erros centralizado e uso de variáveis de ambiente.
- **Banco na Nuvem:** Integração com **Aiven MySQL**, garantindo alta disponibilidade e acesso remoto aos dados.
- **Deploy Contínuo (CI/CD):** Pipeline de deploy automático configurado via **Render** (Backend) e **Vercel** (Frontend).

### Como Rodar o Projeto Localmente

1. Clone o repositório: `git clone https://github.com/um-vini/myclub`
2. Configure os arquivos `.env` nas pastas `/backend` e `/frontend` (conforme os arquivos `.example`).
3. Instale as dependências e rode os serviços:
   - **No backend:** `npm install && npm run dev`
   - **No frontend:** `npm install && npm run dev`

---

Desenvolvido por **Vinícius de Oliveira** - Estudante de Análise e Desenvolvimento de Sistemas (ADS).
