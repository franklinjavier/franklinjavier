---
title: Como evitar prop drilling no React
date: 2022-12-07
description: Estratégias e padrões para resolver o problema de prop drilling em aplicações React
author: Franklin Javier
tags: react, frontend
lang: pt-br
translationKey: avoid-prop-drilling-react
---

Prop drilling é um padrão comum em React onde você precisa passar dados através de múltiplos componentes intermediários para chegar ao componente que realmente precisa deles. Isso se torna problemático porque torna o código mais difícil de manter e reduz a reusabilidade dos componentes.

## O Problema

Quando você tem uma hierarquia profunda de componentes e precisa passar dados do topo até o fundo, acaba tendo que passar props por todos os componentes do meio, mesmo que eles não usem esses dados.

## Soluções

### 1. Componentes Intermediários

Crie componentes wrapper que recebem e encaminham props pela hierarquia. Isso pode organizar melhor a estrutura, mas não elimina completamente o problema.

### 2. React Context

Use a Context API do React para "passar dados para componentes aninhados sem ter que passar props manualmente em cada nível". Esta é a solução mais comum e recomendada pelo próprio React.

```javascript
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

### 3. React Hooks

Use hooks como `useContext` para acessar o contexto de forma simplificada:

```javascript
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <Button theme={theme} />;
}
```

### 4. Bibliotecas de State Management

Implemente soluções externas como:
- **Zustand**: Leve e simples
- **Jotai**: Atomic state management
- **Recoil**: Desenvolvido pelo Facebook

Cada uma oferece diferentes trade-offs entre complexidade e funcionalidades.

## Quando usar cada solução?

- **Context**: Para dados que muitos componentes precisam (tema, usuário autenticado, idioma)
- **State Management Libraries**: Para aplicações complexas com muitos estados compartilhados
- **Props**: Para componentes com hierarquia rasa ou dados usados por poucos componentes

---

Escolha a solução baseada na complexidade da sua aplicação. Nem sempre você precisa de uma biblioteca externa - muitas vezes Context é suficiente.
