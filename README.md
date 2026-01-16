# @traeop/electron-modular

Core module system, DI container, IPC handlers, and window utilities for Electron main process.

## Install

```bash
npm install @traeop/electron-modular
```

> Electron is a peer dependency. Ensure it is installed in the consuming app.

## Usage

```ts
import {
  bootstrapModules,
  RgModule,
  Injectable,
  Inject,
} from "@traeop/electron-modular";
```

## Build

```bash
npm run build
```

## Publish

```bash
npm publish
```

## Notes

- This package uses decorators and `reflect-metadata/lite`.
- If you want a different scope, change the `name` in package.json (e.g. `@your-scope/electron-modular`).
