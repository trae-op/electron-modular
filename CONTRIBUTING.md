# Contributing to @devisfuture/electron-modular

Thank you for your interest in contributing to electron-modular! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Security](#security)
- [Questions & Support](#questions-&-support)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

Read the Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/electron-modular.git`
3. Add upstream remote: `git remote add upstream https://github.com/trae-op/electron-modular.git`

## Development Setup

```bash
npm install
npm run build
npm test
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, Electron version)
- Code samples if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed functionality
- Why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. Create a new branch from `main`:

```bash
   git checkout -b feature/amazing-feature
```

2. Make your changes following our coding standards

3. Add tests for your changes

4. Run tests and ensure they pass:

```bash
   npm test
   npm run build
```

5. Commit your changes:

```bash
   git commit -m "feat: add amazing feature"
```

6. Push to your fork:

```bash
   git push origin feature/amazing-feature
```

7. Open a Pull Request

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update documentation if you're changing functionality
3. Add tests that prove your fix/feature works
4. Ensure all tests pass
5. Your PR will be reviewed by maintainers
6. After approval, a maintainer will merge your PR

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example:

```
feat(di): add support for async factory providers

- Implement async factory resolution
- Add tests for async providers
- Update documentation
```

## Testing

- Write tests for all new features
- Ensure existing tests pass
- Aim for high code coverage
- Use Vitest for testing

```bash
npm test
npm run test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Add examples for new features

## Security

Please do not report security vulnerabilities publicly. Follow the policy in [SECURITY.md](SECURITY.md).

## Questions & Support

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues only for bugs/features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
