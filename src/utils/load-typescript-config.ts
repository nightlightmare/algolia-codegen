import { readFileSync } from 'fs';

/**
 * Loads a TypeScript configuration file by transforming it to JavaScript using esbuild
 * and then importing it as a module.
 */
export async function loadTypeScriptConfig(resolvedPath: string): Promise<any> {
  const esbuild = await import('esbuild');
  
  // Read the TypeScript file
  const source = readFileSync(resolvedPath, 'utf-8');
  
  // Transform TypeScript to JavaScript using esbuild
  const result = esbuild.transformSync(source, {
    loader: 'ts',
    format: 'esm',
    target: 'node20',
    sourcefile: resolvedPath,
  });
  
  if (!result.code) {
    throw new Error('Failed to transform TypeScript config file');
  }
  
  // Evaluate the transformed code as a data URL
  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(result.code)}`;
  const module = await import(dataUrl);
  
  return module;
}

