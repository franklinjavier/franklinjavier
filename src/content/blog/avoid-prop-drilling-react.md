---
title: How to Avoid Prop Drilling in React
date: 2022-12-07
description: Strategies and patterns to solve the prop drilling problem in React applications
author: Franklin Javier
tags: react, frontend
lang: en
translationKey: avoid-prop-drilling-react
---

Prop drilling is a common pattern in React where you need to pass data through multiple intermediate components to reach the component that actually needs it. This becomes problematic because it makes code harder to maintain and reduces component reusability.

## The Problem

When you have a deep component hierarchy and need to pass data from the top to the bottom, you end up having to pass props through all the middle components, even if they don't use that data.

## Solutions

### 1. Intermediate Components

Create wrapper components that receive and forward props down the hierarchy. This can better organize the structure, but doesn't completely eliminate the problem.

### 2. React Context

Use React's Context API to "pass data to nested components without manually passing props at every level". This is the most common solution and recommended by React itself.

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

Use hooks like `useContext` to access context in a simplified way:

```javascript
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <Button theme={theme} />;
}
```

### 4. State Management Libraries

Implement external solutions such as:
- **Zustand**: Lightweight and simple
- **Jotai**: Atomic state management
- **Recoil**: Developed by Facebook

Each offers different trade-offs between complexity and features.

## When to Use Each Solution?

- **Context**: For data that many components need (theme, authenticated user, language)
- **State Management Libraries**: For complex applications with many shared states
- **Props**: For components with shallow hierarchy or data used by few components

---

Choose the solution based on your application's complexity. You don't always need an external library - often Context is sufficient.
