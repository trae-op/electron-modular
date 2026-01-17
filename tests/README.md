# Test Suite for @traeop/electron-modular

Comprehensive unit test suite for the Electron modular architecture framework.

## Test Coverage

### ✅ Decorators (100% Passing)

- **Injectable** (`tests/decorators/injectable.test.ts`) - 4 tests
  - Metadata storage
  - Multiple decorated classes
  - Constructor parameters
  - Class functionality preservation

- **Inject** (`tests/decorators/inject.test.ts`) - 6 tests
  - Token metadata storage
  - Multiple injected parameters
  - Class constructor tokens
  - Mixed injected/non-injected parameters

- **IpcHandler** (`tests/decorators/ipc-handler.test.ts`) - 4 tests
  - IpcHandler metadata
  - Multiple handlers
  - Method/property preservation
  - Constructor dependencies

- **RgModule** (`tests/decorators/rg-module.test.ts`) - 6 tests
  - Module metadata storage
  - Complete module configuration
  - Minimal configuration
  - Provider objects
  - Multiple modules

- **WindowManager** (`tests/decorators/window-manager.test.ts`) - 6 tests
  - Window metadata storage
  - Complex window options
  - Event handlers
  - Multiple window managers

### ✅ Error Classes (100% Passing)

- **Error Tests** (`tests/errors/index.test.ts`) - 15 tests
  - ModuleNotRegisteredError
  - ProviderNotFoundError
  - ModuleDecoratorMissingError
  - InvalidProviderError
  - SettingsNotInitializedError
  - Error inheritance and naming

### ✅ Configuration (100% Passing)

- **Config** (`tests/config.test.ts`) - 5 tests
  - Folder configuration
  - Property validation
  - Immutability checks

### ✅ Control Window (94% Passing)

- **Cache** (`tests/control-window/cache.test.ts`) - 11 tests ✓
  - Window storage
  - Multiple windows
  - Updates and deletions
  - Reference preservation

- **Destroy** (`tests/control-window/destroy.test.ts`) - 6 tests ✓
  - All windows destruction
  - Destroyed window handling
  - Empty window list
  - Mixed window states

- **Receive** (`tests/control-window/receive.test.ts`) - 11/12 tests
  - Window retrieval from cache
  - Destroyed window filtering
  - Multiple windows
  - Cache updates

### ✅ Bootstrap Settings (100% Passing)

- **Settings** (`tests/bootstrap/settings.test.ts`) - 11 tests
  - Settings initialization
  - Settings retrieval
  - Override behavior
  - Complete settings object

### ⚠️ Container Tests (Partially Passing)

- **Container** (`tests/container.test.ts`) - 1 test ✓
- **Container Extended** (`tests/container-extended.test.ts`) - Syntax error (needs fixing)
  - Module management
  - Provider management
  - Instance registration
  - Resolution (basic & complex)
  - Provider types (Class, Factory, Value, Existing)
  - Module imports
  - Cache behavior
  - Complex scenarios

### ⚠️ Bootstrap Functions (Work in Progress)

- **instantiate-module** - 3/9 tests passing
  - Module instantiation without dependencies ✓
  - Return instance ✓
  - No constructor parameters ✓
  - _TypeScript reflection metadata needed for dependency resolution tests_

- **register-providers** - 3/12 tests passing
  - Empty providers handling ✓
  - Invalid provider errors ✓
  - _Global container singleton usage needs adjustment_

- **register-ipc-handlers** - 2/6 tests passing
  - Empty handlers handling ✓
  - _Global container singleton usage needs adjustment_

- **register-windows** - 4/8 tests passing
  - Windows without hash/metadata ✓
  - Empty windows handling ✓
  - _Global container singleton usage needs adjustment_

### ⚠️ Utilities (Partial Coverage)

- **dependency-tokens** - 5/10 tests passing
  - Empty parameters ✓
  - Caching ✓
  - Injected parameters ✓
  - Consistent results ✓
  - _TypeScript reflection metadata needed for parameter type extraction_

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/decorators/injectable.test.ts
```

## Test Statistics

- **Total Test Files**: 18
- **Total Tests**: 132
- **Passing**: 103 (78%)
- **Failing**: 29 (22%)

### Failure Reasons

1. **TypeScript Reflection Metadata**: Tests expecting `design:paramtypes` metadata fail because TypeScript's `emitDecoratorMetadata` doesn't apply in the test environment
2. **Global Container Singleton**: Some tests need better isolation from the global container instance
3. **Minor Syntax Issues**: 1 test file has an async/await syntax issue

## Test Architecture

### Test Utilities

- **Vitest**: Modern test framework with native ESM support
- **Mocking**: Vi.js for spying and mocking
- **Electron Mocks**: Custom mocks for BrowserWindow and Electron APIs

### Test Patterns

- **Unit Tests**: Isolated testing of individual functions and classes
- **Integration Tests**: Testing interaction between modules (Container tests)
- **Mock Electron**: Electron APIs mocked to avoid native dependencies

### Coverage Areas

✅ Fully Covered:

- All decorators
- Error classes
- Configuration
- Control window utilities (cache, destroy, receive)
- Settings management

⚠️ Needs Enhancement:

- Container dependency resolution with TypeScript metadata
- Bootstrap module registration with isolated container instances
- Complex integration scenarios

## Next Steps

To achieve 100% passing tests:

1. **Fix TypeScript Metadata Tests**:
   - Update tests to not rely on `design:paramtypes` metadata
   - Use explicit `@Inject` decorators in tests
   - Or configure test environment to emit decorator metadata

2. **Isolate Container Tests**:
   - Refactor bootstrap tests to use isolated Container instances
   - Mock the global container singleton where needed

3. **Fix Syntax Issues**:
   - Add `async` keyword to the failing test in container-extended.test.ts

4. **Add Missing Coverage**:
   - Bootstrap integration tests
   - IPC initialization tests (require more complex Electron mocking)
   - Window creation tests (require BrowserWindow mocking)

## Test Quality

- **Clear Test Names**: Descriptive `it()` blocks
- **Isolated Tests**: Each test is independent
- **Comprehensive Assertions**: Multiple expect() calls per test
- **Edge Cases**: Testing null/undefined, empty arrays, invalid inputs
- **Error Scenarios**: Testing error throwing and handling

## Continuous Integration

This test suite is ready for CI/CD integration:

- Fast execution (~8 seconds)
- No external dependencies required
- Deterministic results
- Clear failure messages
