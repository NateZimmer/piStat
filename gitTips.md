# Giting CLI started 

Previously I used tortise git. Tortise git is great except when your on a CLI only linux system. Self notes below

## git init 

To start, init

```console
git init
```

## Ignoring folders 

```console
touch .gitignore
echo node_modules>>.gitignore
```

## Seeing Tracked/Untracked files 

``` console
git status
```

## Git adding files 

Git has a CLI to help you add files eaisly. Type:

```console
git add -i
```

This will bring up a window to help you add untracked files. After selecting "add untracked" use `*` to select all untracked files. 

## Git committing files 

```console
git commit -m [Your message here]
```

## Setting up repo for pushing 

```console
git remote add origin https://natezimmer@github.com/NateZimmer/piSense
git push --set-upstream origin master
```

Note, once this is done you will only have to use `git push` in the future. 

