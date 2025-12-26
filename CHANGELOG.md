# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.5] - 2024

### Added

- **Enum type generation**: Automatically generates TypeScript Enum types for string/number arrays with known values (up to 100 unique values)
- **Enhanced type inference**: Fetches 20 sample records instead of 1 to get better type inference, especially for fields with empty arrays
- **Smart array merging**: Merges data from multiple records to ensure proper type detection even when some records have empty arrays
- **Value collection**: Collects all unique values from all records for array fields to generate comprehensive Enum types

### Changed

- Improved type generation for arrays - now uses Enum types instead of `string[]` or `number[]` when all possible values are known
- Enhanced logging to show number of records fetched and fields with Enum generation

### Fixed

- Fixed issue where empty arrays resulted in `unknown[]` type - now properly infers types from records with populated arrays
- Improved handling of nested objects with array fields

## [0.1.4] - 2024

### Added

- CLI options documentation for `--verbose` and `--dry-run` flags in README

### Fixed

- Fixed test suite by adding logger parameter to `fetchAlgoliaData` function calls
- Fixed ESLint configuration to ignore `test-config-invalid.js` file
- Updated test expectations to match new logger-based implementation

### Changed

- Improved code formatting consistency across the codebase

## [0.1.3] - 2024

### Added

- MIT License
- Comprehensive test suite with Vitest
- ESLint and Prettier configuration
- GitHub Actions workflows for automated testing, linting, and formatting
- Test coverage reporting
- Contributing guidelines (CONTRIBUTING.md)
- Enhanced README with badges (npm version, downloads, bundle size, GitHub stars, issues, license, Node.js version)

### Changed

- Enhanced error reporting with specific paths and types for better debugging
- Improved configuration validation with detailed error messages

### Fixed

- Import statement cleanup in config.ts (removed unused UrlSchema type)

## [0.1.2] - 2024

### Added

- Dotenv support for environment variables (automatically loads `.env` file)
- Enhanced TypeScript config handling
- Example configuration files for Algolia code generation

### Changed

- Improved configuration loading mechanism
- Updated dependencies

## [0.1.1] - 2024

### Added

- Type-check script to package.json
- `tsx` as a devDependency for TypeScript execution
- Enhanced README with quick start guide and configuration examples

### Changed

- Updated import statement in README.md for consistency

## [0.1.0] - 2024

### Added

- Initial release
- CLI tool for generating TypeScript types from Algolia indices
- Support for multiple indices configuration
- Flexible configuration through TypeScript/JavaScript config files
- Type generation from sample Algolia records
- Support for nested objects, arrays, and complex types
- Automatic detection of Algolia's `IdValue` pattern (arrays of objects with `id` and `value` properties)
- Generic `IdValue<T>` type generation
- Type dependency sorting for correct ordering
- Prefix and postfix options for generated type names
- File overwrite protection
- Error handling that continues processing other files even if one fails
- Both ESM and CommonJS format support
- Configuration validation utilities
- Export of validation functions for advanced usage

[0.1.5]: https://github.com/nightlightmare/algolia-codegen/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/nightlightmare/algolia-codegen/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/nightlightmare/algolia-codegen/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/nightlightmare/algolia-codegen/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/nightlightmare/algolia-codegen/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/nightlightmare/algolia-codegen/releases/tag/v0.1.0
