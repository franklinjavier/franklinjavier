---
title: Cache de senha no Git
date: 2015-08-05
description: Um jeito simples de fazer o Git memorizar sua senha
author: Franklin Javier
tags: git
---

Toda vez que eu vou dar um pull ou push de um projeto clonado via HTTPS, o Git solicita minha senha.
Convenhamos, é uma chatice não é? 

Para contornar isso, você pode usar a *credential helper* para dizer ao Git memorizar sua senha por
um determinado tempo. 

## Exemplo

```
$ git config credential.helper cache
```

Esse momento o Git pede a senha para poder memorizá-la.

```
$ git push
Password: 
```

Pronto, memorizou. Agora suas credencias serão usadas automaticamente.

```
$ git push

Counting objects: 26, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (5/5), done.
Total 6 (delta 3), reused 0 (delta 0)
To https://example.com/repo.git
   a577d95..5774c51  bla -> bla
```

## Local vs Global 
O primeiro comando irá memorizar a senha apenas daquele repositório. Para que funcione em todos repositórios,
adicione o parâmetro ```global```.

```
$ git config --global credential.helper cache
```

## Tempo de memorização
O Git irá memorizar sua senha por 15 minutos, caso queira  
mudar esse tempo, basta adicionar o parâmetro ```timeout```.

```
$ git config --global credential.helper 'cache --timeout=3600'
```

O parâmetro ```timeout``` recebe valor em segundos, então, nesse caso, ficará memorizado por 60 minutos (1 hora).

---

Se você clonou o repositório usando SSH, é possível se autenticar usando a chave SSH ao invés de usuário e senha. Para mais detalhes, [consulte esse guia](https://help.github.com/articles/generating-ssh-keys/). 
