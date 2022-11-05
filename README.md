# Freezircular

Freezircular is a tool to detect circular dependencies in your code. It keeps track of which
circular dependencies were there before, and which are new. The main motivation for this tool
is to prevent new circular dependencies from being added to a codebase.

## Setup

Make sure to set up the settings in your `package.json` file - the `entryPath` for your app
is the most important bit.

If you are setting up Freezircular on a codebase which already has circular dependencies on
it, you should let Freezircular know that there are some old ones by creating a baseline. To
do this, run Freezircular with the `--baseline` parameter:

```
npx freezircular --baseline
```

Finally, we suggest setting Freezircular up as a pre-commit hook, e.g., using
[husky](https://typicode.github.io/husky/#/):

```
npm husky add .husky/pre-commit npx freezircular
```

## Settings

Set up settings in your `package.json` file, on a property called `freezircular`.

```json
   "freezircular": {
        "entryPath": "src/index.ts",
        "autoAddDeps": true,
        "previousDepsPath": ".freezircularDeps",
        "verbose": true
   },
```

- `entryPath`: starting point for your application, typically `index.ts`, `src/index.ts`,
  `src/App.tsx` or something like that. If it's not set, Freezircular will look for an
  `index` file and if it can't find one, it will fail.

- `autoAddDeps`: whether the `.freezircularDeps`, which keeps track of previous circular
  dependencies, should be added to git via `git add` after every change to circular
  dependencies. Defaults to `true`.

- `previousDepsPath`: path to the file which contains the previous baseline for circular
  dependencies. Normally you won't need to modify the default. Defaults to
  `.freezircularDeps`.

- `verbose`: whether to show a message whenever there are no new circular dependencies
  introduced. Defaults to `true`.
