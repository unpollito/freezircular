# CHANGELOG

## 1.5.0

Ignore async imports and type imports when looking for circular dependencies.

## 1.4.0

Set a consistent order for circular deps in `.freezircularDeps`. The order used to be
non-deterministic, which caused the dependencies to move around between runs, thus making
diffs harder.

## 1.3.0

- Enable support for tsconfig.json: if there's one, freezircular will load it automatically
  and pass it to `madge`. You can also specify now a `tsConfig` parameter in `package.json`.
- Fix issue where circular dependencies of length 1 were still being considered when
  counting the number of removed circular dependencies.

## 1.2.0

Pretty-print `.freezircularDeps` by default instead of dropping all the output in a single
line.

## 1.1.1

Do not report on circular dependencies of length 1 (i.e., files depending on themselves).
These could be caused by a bug in `madge`: https://github.com/pahen/madge/issues/306

## 1.1.0

Ensure that Freezircular tracks dependencies on .js, .jsx, .ts and .tsx files.

## 1.0.4

Use a custom version of `madge` to support Node 18, since at the moment (2022-11-24), it has
a npm dependency which requires Node 16. Hopefully this will be changed in `madge` soon and
we'll go back to the official `madge` version.

## 1.0.3

Fix a bug where file sorting within dependencies was **very** broken and thus a lot of old
dependencies were actually identified as new. Versions pre-1.0.3 are essentially broken.

## 1.0.2

Only README changes, no functionality changes.

## 1.0.1

First version.
