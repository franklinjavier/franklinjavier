---
title: Git Password Cache
date: 2015-08-05
description: A simple way to make Git remember your password
author: Franklin Javier
tags: git
lang: en
translationKey: git-password-cache
---

Every time I do a pull or push from a project cloned via HTTPS, Git asks for my password.
Let's face it, it's annoying, isn't it?

To work around this, you can use the *credential helper* to tell Git to remember your password for
a certain amount of time.

## Example

```bash
$ git config credential.helper cache
```

At this point Git asks for the password to remember it.

```bash
$ git push
Password:
```

Done, it remembered. Now your credentials will be used automatically.

```bash
$ git push

Counting objects: 26, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (5/5), done.
Total 6 (delta 3), reused 0 (delta 0)
To https://example.com/repo.git
   a577d95..5774c51  bla -> bla
```

## Local vs Global
The first command will remember the password only for that repository. To make it work for all repositories,
add the `global` parameter.

```bash
$ git config --global credential.helper cache
```

## Memorization Time
Git will remember your password for 15 minutes. If you want to
change this time, just add the `timeout` parameter.

```bash
$ git config --global credential.helper 'cache --timeout=3600'
```

The `timeout` parameter receives a value in seconds, so in this case, it will be remembered for 60 minutes (1 hour).

---

If you cloned the repository using SSH, you can authenticate using the SSH key instead of username and password. For more details, [check out this guide](https://help.github.com/articles/generating-ssh-keys/).
