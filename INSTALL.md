# Instalação do Fundify Dashboard

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## Passos de Instalação

1. **Instalar dependências do projeto raiz:**
```bash
npm install
```

2. **Instalar dependências do frontend:**
```bash
cd frontend
npm install
cd ..
```

3. **Instalar dependências do backend:**
```bash
cd backend
npm install
cd ..
```

**OU use o comando único:**
```bash
npm run install:all
```

## Executar o Projeto

### Desenvolvimento (Backend + Frontend simultaneamente)
```bash
npm run dev
```

### Apenas Frontend
```bash
npm run dev:frontend
```

### Apenas Backend
```bash
npm run dev:backend
```

## Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Estrutura do Projeto

```
fundify-dashboard/
├── frontend/          # Aplicação React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Serviços de API
│   │   └── App.tsx        # Componente principal
│   └── package.json
├── backend/           # API Node.js + Express
│   ├── src/
│   │   └── index.ts      # Servidor Express
│   └── package.json
└── package.json       # Workspace root
```

## Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Estilização**: CSS Modules com variáveis CSS

## Características do Dashboard

✅ Design moderno inspirado no Fundify  
✅ Cards de métricas financeiras  
✅ Gráficos interativos (linha e barras)  
✅ Lista de transações recentes  
✅ Layout responsivo  
✅ Tema escuro elegante  
✅ Animações suaves  

