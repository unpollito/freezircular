# Freezircular

Freezircular is a tool to detect circular dependencies in your code. It keeps track of which
circular dependencies were there before, and which are new. The main motivation for this tool
is to prevent new circular dependencies from being added to a codebase.

Freezircular keeps a baseline of circular dependencies in your codebase - you can either set
it up to prevent new circular dependencies from being added to a codebase, or to just prevent
any circular dependencies whatsoever from being added.

To run it, invoke `npx freezircular` - it will let you know if any new circular dependencies
are added while ignoring previously existing ones.

## Setup

### Settings

Make sure to set up the settings in your `package.json` file, on a property called
`freezircular`. The `entryPath` for your app is the most important bit.

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

### Establish a baseline

If you are setting up Freezircular on a codebase which already has circular dependencies on
it, you should let Freezircular know that there are some old ones by creating a baseline. To
do this, run Freezircular with the `--baseline` parameter:

```
npx freezircular --baseline
```

This will store the information of your circular deps in the file specified in `previousDepsPath`
(by default, `.freezircularDeps`). Freezircular will take care of updating this file as circular
dependencies get removed.

### Pre-commit hook

Finally, it's suggested to set Freezircular up as a pre-commit hook, e.g., using
[husky](https://typicode.github.io/husky/#/):

```
npx husky add .husky/pre-commit npx freezircular
```

Execution will fail (i.e., the commit will be aborted) if Freezircular detects any new circular
dependencies, but any previously existing circular dependencies will be ignored.
