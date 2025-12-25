import type { AlgoliaCodegenGeneratorConfig } from '../types.js';

// Type generation utilities
interface TypeInfo {
  type: string;
  isOptional: boolean;
  isArray: boolean;
  nestedTypes: Map<string, TypeInfo>;
}

class TypeGenerator {
  private typeMap = new Map<string, string>();
  private generatedTypes = new Set<string>();
  private idValueTypes = new Set<string>();
  private prefix: string;
  private postfix: string;
  private indexName: string;

  constructor(config: AlgoliaCodegenGeneratorConfig) {
    this.prefix = config.prefix || '';
    this.postfix = config.postfix || '';
    this.indexName = config.indexName;
  }

  /**
   * Convert a value to its TypeScript type representation
   */
  inferType(value: unknown, path: string[] = []): TypeInfo {
    if (value === null || value === undefined) {
      return { type: 'unknown', isOptional: true, isArray: false, nestedTypes: new Map() };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: 'unknown[]', isOptional: false, isArray: true, nestedTypes: new Map() };
      }

      // Analyze all items in array to find common type
      const itemTypes = value.map((item, idx) => this.inferType(item, [...path, `[${idx}]`]));

      // Check if all items are objects with same structure (AlgoliaIdValue pattern)
      if (this.isIdValuePattern(value)) {
        const firstItem = value[0] as { id: string; value: unknown };
        const valueType = this.inferType(firstItem.value, [...path, '[0].value']);
        const idValueTypeName = `${this.prefix}IdValue`;
        // Register IdValue type for generation
        this.idValueTypes.add(idValueTypeName);
        // Use generic type with value type parameter
        const typeString = valueType.type !== 'string' 
          ? `${idValueTypeName}<${valueType.type}>`
          : idValueTypeName;
        return {
          type: `${typeString}[]`,
          isOptional: false,
          isArray: true,
          nestedTypes: new Map(),
        };
      }

      // Check if all items are the same type
      const firstType = itemTypes[0];
      const allSameType = itemTypes.every(t =>
        t.type === firstType.type &&
        !t.isArray &&
        t.nestedTypes.size === firstType.nestedTypes.size
      );

      if (allSameType && !firstType.isArray) {
        return {
          type: `${firstType.type}[]`,
          isOptional: false,
          isArray: true,
          nestedTypes: firstType.nestedTypes,
        };
      }

      // Mixed types - use union
      const uniqueTypes = Array.from(new Set(itemTypes.map(t => t.type)));
      const unionType = uniqueTypes.length === 1
        ? uniqueTypes[0]
        : uniqueTypes.join(' | ');

      return {
        type: `${unionType}[]`,
        isOptional: false,
        isArray: true,
        nestedTypes: new Map(),
      };
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const typeName = this.generateTypeName(path);
      const nestedTypes = new Map<string, TypeInfo>();

      for (const [key, val] of Object.entries(obj)) {
        nestedTypes.set(key, this.inferType(val, [...path, key]));
      }

      // Register this type for generation
      if (!this.generatedTypes.has(typeName)) {
        this.generatedTypes.add(typeName);
        this.typeMap.set(typeName, this.generateInterface(typeName, nestedTypes, obj));
      }

      return {
        type: typeName,
        isOptional: false,
        isArray: false,
        nestedTypes,
      };
    }

    // Primitive types
    const jsType = typeof value;
    let tsType: string;
    if (jsType === 'number') {
      tsType = 'number';
    } else if (jsType === 'boolean') {
      tsType = 'boolean';
    } else {
      tsType = 'string';
    }
    return { type: tsType, isOptional: false, isArray: false, nestedTypes: new Map() };
  }

  /**
   * Check if an array follows the AlgoliaIdValue pattern
   */
  private isIdValuePattern(arr: unknown[]): boolean {
    return arr.length > 0 &&
      arr.every(item =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'value' in item &&
        typeof (item as { id: unknown }).id === 'string'
      );
  }

  /**
   * Generate a TypeScript type name from a path
   */
  private generateTypeName(path: string[]): string {
    if (path.length === 0) {
      return `${this.prefix}Hit${this.postfix}`;
    }

    // Get the last meaningful part of the path
    const lastPart = path[path.length - 1];

    // Convert camelCase or snake_case to PascalCase
    const parts = lastPart
      .replace(/[\[\]]/g, '') // Remove array brackets
      .split(/[-_\s]+/)
      .filter(Boolean);

    const pascalCase = parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');

    // Special handling for known patterns
    if (path.length > 1) {
      const parent = path[path.length - 2];
      if (parent.includes('Info')) {
        return `${this.prefix}${pascalCase}Info${this.postfix}`;
      }
    }

    return `${this.prefix}${pascalCase}${this.postfix}`;
  }

  /**
   * Generate TypeScript interface code
   */
  private generateInterface(typeName: string, nestedTypes: Map<string, TypeInfo>, sampleObj: Record<string, unknown>): string {
    const lines: string[] = [];

    // Add JSDoc comment
    const description = this.getTypeDescription(typeName);
    lines.push('/**');
    lines.push(` * ${description}`);
    lines.push(' */');

    lines.push(`export interface ${typeName} {`);

    // Sort keys for consistent output
    const sortedKeys = Array.from(nestedTypes.keys()).sort();

    for (const key of sortedKeys) {
      const typeInfo = nestedTypes.get(key)!;
      const value = sampleObj[key];

      // Determine if field is optional
      const isOptional = typeInfo.isOptional || value === null || value === undefined;
      const optionalMarker = isOptional ? '?' : '';

      // Generate type string
      let typeString = typeInfo.type;

      // Handle arrays
      if (typeInfo.isArray && !typeString.endsWith('[]')) {
        typeString = `${typeString}[]`;
      }

      // Add null if value can be null
      if (value === null && typeString !== 'null') {
        typeString = `${typeString} | null`;
      }

      lines.push(`  ${key}${optionalMarker}: ${typeString};`);
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Get a description for a type based on its name
   */
  private getTypeDescription(typeName: string): string {
    // Remove prefix and postfix and convert PascalCase to readable text
    const withoutPrefix = typeName.replace(new RegExp(`^${this.prefix}`), '');
    const withoutPostfix = withoutPrefix.replace(new RegExp(`${this.postfix}$`), '');
    const readable = withoutPostfix
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();

    return readable.charAt(0).toUpperCase() + readable.slice(1) + ' structure in Algolia';
  }

  /**
   * Collect all types that need to be generated
   */
  private collectTypes(typeInfo: TypeInfo, typesToGenerate: Set<string>): void {
    if (typeInfo.nestedTypes.size > 0 && !typeInfo.isArray) {
      typesToGenerate.add(typeInfo.type);
      for (const nestedTypeInfo of typeInfo.nestedTypes.values()) {
        this.collectTypes(nestedTypeInfo, typesToGenerate);
      }
    }
  }

  /**
   * Get dependencies for a type (types that it references)
   */
  private getTypeDependencies(typeName: string): string[] {
    const typeCode = this.typeMap.get(typeName);
    if (!typeCode) return [];

    const dependencies: string[] = [];
    const importRegex = new RegExp(`(${this.prefix}\\w+)`, 'g');
    const matches = typeCode.matchAll(importRegex);

    for (const match of matches) {
      const depTypeName = match[1];
      if (depTypeName !== typeName && this.generatedTypes.has(depTypeName)) {
        dependencies.push(depTypeName);
      }
    }

    return Array.from(new Set(dependencies));
  }

  /**
   * Sort types by dependencies (topological sort)
   */
  private sortTypesByDependencies(typeNames: string[]): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (typeName: string) => {
      if (visiting.has(typeName)) {
        // Circular dependency detected, but we'll still add it
        return;
      }
      if (visited.has(typeName)) {
        return;
      }

      visiting.add(typeName);
      const dependencies = this.getTypeDependencies(typeName);
      for (const dep of dependencies) {
        visit(dep);
      }
      visiting.delete(typeName);
      visited.add(typeName);
      sorted.push(typeName);
    };

    for (const typeName of typeNames) {
      visit(typeName);
    }

    return sorted;
  }

  /**
   * Generate IdValue type definition (generic type)
   */
  private generateIdValueType(typeName: string): string {
    return `export type ${typeName}<T = string> = {\n  id: string;\n  value: T;\n};\n\n`;
  }

  /**
   * Generate all types as a single file content
   */
  generateAllTypes(sampleHit: Record<string, unknown>): string {
    // Analyze the root hit
    const rootType = this.inferType(sampleHit, []);

    // Collect all types that need to be generated
    const typesToGenerate = new Set<string>();
    this.collectTypes(rootType, typesToGenerate);

    // Always include root type if it's an object type
    const rootTypeName = rootType.type;
    if (rootType.nestedTypes.size > 0 && !rootType.isArray) {
      typesToGenerate.add(rootTypeName);
    }

    // Sort types by dependencies
    const sortedTypes = this.sortTypesByDependencies(Array.from(typesToGenerate));

    // Build file content
    const lines: string[] = [];

    // Add file header
    lines.push('/**');
    lines.push(` * Generated TypeScript types for Algolia index: ${this.indexName}`);
    lines.push(' * This file is auto-generated. Do not edit manually.');
    lines.push(' */');
    lines.push('');

    // Add IdValue type first if it's used (it doesn't depend on other types)
    if (this.idValueTypes.size > 0) {
      const idValueTypeName = Array.from(this.idValueTypes)[0];
      lines.push(this.generateIdValueType(idValueTypeName));
    }

    // Add all types in dependency order
    for (const typeName of sortedTypes) {
      const typeCode = this.typeMap.get(typeName);
      if (typeCode) {
        lines.push(typeCode);
      }
    }

    return lines.join('\n');
  }
}

/**
 * Generates TypeScript types from a sample Algolia hit
 */
export function generateTypeScriptTypes(
  sampleHit: Record<string, unknown>,
  config: AlgoliaCodegenGeneratorConfig
): string {
  const generator = new TypeGenerator(config);
  return generator.generateAllTypes(sampleHit);
}
