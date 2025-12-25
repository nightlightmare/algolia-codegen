/**
 * Algolia Type Generator
 * 
 * This script automatically generates TypeScript types from Algolia indices
 * by fetching a sample record and analyzing its structure.
 * 
 * Repository: https://github.com/nightlightmare/algolia-codegen
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

import { algoliasearch } from 'algoliasearch';
import { config } from 'dotenv';

// Load environment variables - try multiple common locations
const envFiles = [
  join(process.cwd(), '.env'),
  join(process.cwd(), '.env.local'),
  join(process.cwd(), '.env.development.local'),
];

let envLoaded = false;
let loadedFrom = '';
for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    config({ path: envFile });
    envLoaded = true;
    loadedFrom = envFile;
    console.log(`Loaded environment variables from: ${envFile}`);
    break;
  }
}

// If no env file found, try loading from default locations
if (!envLoaded) {
  config();
  console.log('Attempted to load environment variables from default locations');
}

const ALGOLIA_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
  INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
};

if (!ALGOLIA_CONFIG.APP_ID || !ALGOLIA_CONFIG.SEARCH_KEY || !ALGOLIA_CONFIG.INDEX_NAME) {
  const missing = [];
  if (!ALGOLIA_CONFIG.APP_ID) missing.push('NEXT_PUBLIC_ALGOLIA_APP_ID');
  if (!ALGOLIA_CONFIG.SEARCH_KEY) missing.push('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
  if (!ALGOLIA_CONFIG.INDEX_NAME) missing.push('NEXT_PUBLIC_ALGOLIA_INDEX_NAME');
  
  const envFileList = envFiles.map(f => `  - ${f}`).join('\n');
  const loadedInfo = loadedFrom ? `\nLoaded from: ${loadedFrom}` : '\nNo .env file found in checked locations.';
  
  throw new Error(
    `Missing required Algolia environment variables: ${missing.join(', ')}\n` +
    `Checked for .env files in:\n${envFileList}${loadedInfo}\n` +
    `Please ensure your .env file is in packages/app/ directory with the required variables.`
  );
}

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
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
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
        return {
          type: `AlgoliaIdValue${valueType.type !== 'string' ? `<${valueType.type}>` : ''}[]`,
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
    if (path.length === 0) return 'AlgoliaHit';

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
      if (parent === 'campground') {
        return `AlgoliaCampground${pascalCase}`;
      }
      if (parent.includes('Info') || parent.includes('Info')) {
        return `Algolia${pascalCase}Info`;
      }
    }

    return `Algolia${pascalCase}`;
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
    // Remove 'Algolia' prefix and convert PascalCase to readable text
    const withoutPrefix = typeName.replace(/^Algolia/, '');
    const readable = withoutPrefix
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();

    return readable.charAt(0).toUpperCase() + readable.slice(1) + ' structure in Algolia';
  }

  /**
   * Generate all type files
   */
  async generateTypes(sampleHit: Record<string, unknown>): Promise<void> {
    // Analyze the root hit
    const rootType = this.inferType(sampleHit, []);

    // Collect all types that need to be generated
    const typesToGenerate = new Set<string>();
    const collectTypes = (typeInfo: TypeInfo) => {
      if (typeInfo.nestedTypes.size > 0 && !typeInfo.isArray) {
        typesToGenerate.add(typeInfo.type);
        for (const nestedTypeInfo of typeInfo.nestedTypes.values()) {
          collectTypes(nestedTypeInfo);
        }
      }
    };

    collectTypes(rootType);

    // Generate type files
    for (const typeName of Array.from(this.generatedTypes).sort()) {
      const typeCode = this.typeMap.get(typeName);
      if (typeCode) {
        // Extract imports needed for this type
        const imports = this.extractImports(typeCode, typeName);
        const fileContent = this.generateFileContent(typeName, imports, typeCode);

        const fileName = `${typeName}.ts`;
        const filePath = join(this.outputDir, fileName);

        // Ensure directory exists
        const dir = dirname(filePath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        writeFileSync(filePath, fileContent, 'utf-8');
        console.log(`Generated: ${fileName}`);
      }
    }

    // Generate main index file
    this.generateIndexFile();
  }

  /**
   * Extract imports needed for a type
   */
  private extractImports(typeCode: string, currentType: string): string[] {
    const imports: string[] = [];
    const importRegex = /(Algolia\w+)/g;
    const matches = typeCode.matchAll(importRegex);

    for (const match of matches) {
      const typeName = match[1];
      if (typeName !== currentType && this.generatedTypes.has(typeName)) {
        imports.push(typeName);
      }
    }

    return Array.from(new Set(imports)).sort();
  }

  /**
   * Generate file content with imports
   */
  private generateFileContent(typeName: string, imports: string[], typeCode: string): string {
    const lines: string[] = [];

    // Add imports
    if (imports.length > 0) {
      for (const imp of imports) {
        lines.push(`import type { ${imp} } from './${imp}';`);
      }
      lines.push('');
    }

    // Add type code
    lines.push(typeCode);

    return lines.join('\n');
  }

  /**
   * Generate index.ts file that exports all types
   */
  private generateIndexFile(): void {
    const lines: string[] = [];
    const sortedTypes = Array.from(this.generatedTypes).sort();

    for (const typeName of sortedTypes) {
      lines.push(`export type { ${typeName} } from './${typeName}';`);
    }

    const indexPath = join(this.outputDir, 'index.ts');
    writeFileSync(indexPath, lines.join('\n') + '\n', 'utf-8');
    console.log('Generated: index.ts');
  }
}

/**
 * Main function to generate types from Algolia
 */
async function main() {
  console.log('Connecting to Algolia...');

  const client = algoliasearch(
    ALGOLIA_CONFIG.APP_ID,
    ALGOLIA_CONFIG.SEARCH_KEY,
  );

  console.log(`Fetching sample record from index: ${ALGOLIA_CONFIG.INDEX_NAME}`);

  // Fetch a sample record
  const result = await client.searchSingleIndex({
    indexName: ALGOLIA_CONFIG.INDEX_NAME,
    searchParams: {
      query: '',
      hitsPerPage: 1,
    },
  });

  if (!result.hits || result.hits.length === 0) {
    throw new Error('No hits found in Algolia index');
  }

  const sampleHit = result.hits[0] as Record<string, unknown>;
  console.log('Sample record fetched successfully');
  console.log(`ObjectID: ${sampleHit.objectID || 'N/A'}`);

  // Determine output directory
  // Use process.cwd() to get the project root, then navigate to types directory
  const projectRoot = process.cwd();
  const outputDir = join(projectRoot, 'src/shared/algolia/');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating types to: ${outputDir}`);

  const generator = new TypeGenerator(outputDir);
  await generator.generateTypes(sampleHit);

  console.log('Type generation complete!');
}

// Run the script
main().catch((error) => {
  console.error('Error generating types:', error);
  process.exit(1);
});

