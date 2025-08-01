/**
 * Inject decorator implementation
 * Enables parameter-level dependency injection
 */

import 'reflect-metadata';
import type { DIToken, ParameterDecorator } from '../types/di-types.js';
import { getInjectionTokens, setInjectionTokens } from './injectable.js';

/**
 * Inject decorator for marking constructor parameters for injection
 */
export function inject<T>(token: DIToken<T>): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    // Get existing injection tokens
    const existingTokens = getInjectionTokens(target) || [];
    
    // Ensure array is large enough
    while (existingTokens.length <= parameterIndex) {
      existingTokens.push(undefined);
    }
    
    // Set the token for this parameter
    existingTokens[parameterIndex] = token;
    
    // Update metadata
    setInjectionTokens(target, existingTokens);
  };
}

/**
 * Get the injection token for a specific parameter
 */
export function getInjectionToken(constructor: any, parameterIndex: number): DIToken<any> | undefined {
  const tokens = getInjectionTokens(constructor);
  return tokens?.[parameterIndex];
}

/**
 * Check if a parameter has an injection token
 */
export function hasInjectionToken(constructor: any, parameterIndex: number): boolean {
  return getInjectionToken(constructor, parameterIndex) !== undefined;
}