# Lazy Loading Implementation Plan for @devisfuture/electron-modular

## Overview

This document describes the implementation plan for adding lazy loading functionality to the `@devisfuture/electron-modular` package. The implementation must strictly follow the **Open/Closed Principle** from SOLID - adding new functionality without modifying existing working code.

## Goals

1. Add lazy loading support for modules
2. Enable automatic module initialization on IPC trigger
3. Maintain 100% backward compatibility
4. No breaking changes to existing API
5. Follow Open/Closed Principle strictly

## User-Facing API

### Without Lazy (Existing Behavior - No Changes)

```typescript
@RgModule({
  providers: [UserService],
  ipc: [UserIpc],
  windows: [UserWindow],
})
export class UserModule {}
```

**Result**: Module loads immediately during `bootstrapModules()` call.

### With Lazy (New Functionality)

```typescript
@RgModule({
  providers: [AnalyticsService],
  ipc: [AnalyticsIpc],
  windows: [AnalyticsWindow],
  lazy: {
    enabled: true,
    trigger: "analytics",
  },
})
export class AnalyticsModule {}
```

**Result**:

- Module does NOT load during `bootstrapModules()` call
- Module loads automatically when `ipcRenderer.invoke('analytics')` is called from renderer process
- After first load, module behaves exactly like eager-loaded module

## Expected Behavior

### Scenario 1: Module with exact trigger

Main process:

```typescript
// Module definition
@RgModule({
  imports: [RestApiModule],
  providers: [AnalyticsService],
  ipc: [AnalyticsIpc],
  windows: [AnalyticsWindows],
  lazy: {
    enabled: true,
    trigger: "analytics",
  },
})
export class AnalyticsModule {}

// main.ts
app.on("ready", async () => {
  await bootstrapModules([
    UserModule, // ✅ Fully initialized NOW
    AnalyticsModule, // ❌ NOT initialized
  ]);

  console.log("App ready!");
});
```

Renderer process:

```typescript
type TInitAnalyticsModule = {
  initialized: boolean; // true/false
  name: string; // name of module 'analytics'
  error?: {
    // when something wrong
    message: string;
  };
};
const initAnalyticsModule: TInitAnalyticsModule =
  await ipcRenderer.invoke("analytics");
console.log(initAnalyticsModule); // module is initialized or not!
```

### Scenario 2: Complex module with all features

```typescript
@RgModule({
  imports: [RestApiModule, DatabaseModule],
  providers: [
    AnalyticsService,
    {
      provide: ANALYTICS_CONFIG,
      useFactory: (dbService: DatabaseService) => ({
        connection: dbService.getConnection(),
      }),
      inject: [DatabaseService],
    },
  ],
  ipc: [AnalyticsIpc],
  windows: [AnalyticsWindow],
  exports: [AnalyticsService],
  lazy: {
    enabled: true,
    trigger: "analytics",
  },
})
export class AnalyticsModule {}
```

## Implementation Requirements

### 1. Type Definitions

Add new type definitions **without modifying existing types**:

```typescript
type TLazyConfig = {
  enabled: true;
  trigger: string;
};

type TModuleMetadata = {
  // ... existing fields ...
  lazy?: TLazyConfig;
};
```

### 2. Bootstrap Function Enhancement

Modify `bootstrapModules()` to handle lazy modules **without breaking eager loading**:

**Current behavior (must remain unchanged):**

```typescript
await bootstrapModules([UserModule]);
// UserModule is fully initialized
```

**New behavior (only when lazy is specified):**

```typescript
await bootstrapModules([
  UserModule, // Eager: fully initialized
  AnalyticsModule, // Lazy: NOT initialized
]);
```

**Required changes:**

- Detect if module has `lazy.enabled === true`
- If yes: register only one `ipcMain.handle` // for example "analytics". This name of channel take from `lazy.trigger`
- If no: use existing initialization logic (no changes)

## Implementation Checklist

- [ ] Add `TLazyConfig` type definition
- [ ] Add `lazy?: TLazyConfig` to module metadata type
- [ ] Extend module registry to track loading state
- [ ] Modify `bootstrapModules()` to detect lazy modules
- [ ] Create lazy module registration logic (separate from initialization)
- [ ] Create trigger matching logic
- [ ] Implement module loading function (reusing existing init logic)
- [ ] Write tests for backward compatibility
- [ ] Write tests for lazy loading scenarios
- [ ] Write tests for edge cases (concurrent loading, errors, etc.)
- [ ] Update documentation
- [ ] Update examples

## Key Principles

1. **Open/Closed Principle**: Add new code, do NOT modify existing working code
2. **Backward Compatibility**: Modules without `lazy` field must work exactly as before
3. **Code Reuse**: Use existing initialization functions, do NOT duplicate logic
4. **Consistency**: Lazy-loaded modules must behave identically to eager-loaded modules after initialization
5. **Type Safety**: All new code must be fully typed with TypeScript
6. **Error Handling**: Handle edge cases (module not found, loading errors, concurrent loads)

## Success Criteria

1. All existing tests pass without modifications
2. Modules without `lazy` field work exactly as before
3. Lazy modules do NOT initialize during `bootstrapModules()`
4. After initialization, lazy modules behave identically to eager modules
5. No code duplication between eager and lazy initialization
6. Full TypeScript type safety
7. Clear error messages for misconfigurations

## Final Notes

This implementation plan ensures:

- ✅ Zero breaking changes
- ✅ Full backward compatibility
- ✅ Clean architecture following SOLID principles
- ✅ Minimal code duplication
- ✅ Type-safe implementation
- ✅ Clear error messages
- ✅ Good developer experience

The AI agent should analyze the existing codebase structure and implement lazy loading by **adding new code** rather than **modifying existing working code**.

## The result when used should be approximately as follows

**The main process.**
The file `main.ts`:

```typescript
import { app } from "electron";
import { bootstrapModules, ... } from "@devisfuture/electron-modular";

......

app.on("ready", async () => {
  await bootstrapModules([
    UserModule,
    AnalyticsModule, // lazy module
  ]);
});
```

The file `module.ts`:

```typescript
import { RgModule } from "@devisfuture/electron-modular";
import { AnalyticsService } from "./service.js";
import { RestApiService } from "../rest-api/service.js";
import { REST_API_PROVIDER } from "./tokens.js";
import { AnalyticsIpc } from "./ipc.js";
import { AnalyticsWindow } from "./windows.js";
import type { TAuthProvider, TWordsRestApiProvider } from "./types.js";

......

@RgModule({
  imports: [RestApiModule],
  providers: [
    AnalyticsService,
    {
      provide: REST_API_PROVIDER,
      useFactory: (restApiService: RestApiService): TWordsRestApiProvider => ({
         get: () => restApiService.get('https://example.com/api/user/1'),
      }),
      inject: [RestApiService],
    },
  ],
  ipc: [AnalyticsIpc],
  windows: [AnalyticsWindow],
  lazy: {
    enabled: true,
    trigger: "analytics",
  },
})
export class AnalyticsModule {}
```

The file `preload.cts`:

```typescript
const electron = require("electron");

type TInitDataLazy = {
  initialized: boolean; // true/false
  name: string; // name of module 'analytics'
  error?: {
    // when something wrong
    message: string;
  };
};

electron.contextBridge.exposeInMainWorld("electron", {
  invoke: (key: string, payload: any): TInitDataLazy => {
    return electron.ipcRenderer.invoke(key, payload);
  },
});
```

**The renderer process.**
The file `App.tsx`:

```typescript
import { useEffect, useCallback } from "react";

....

export const App = () => {

  const initAnalyticsModule = useCallback(async () => {
    const { initialized, name, error } = await window.electron.invoke("analytics");

    if (initialized && error === undefined) {
      console.log('Success!', 'Module:', name);
    } else {
      console.log('Error!', 'Module:', name, error.message);
    }
  }, []);

  useEffect(() => {
    initAnalyticsModule();
  }, [initAnalyticsModule]);

  return <>Home</>;
};
```
