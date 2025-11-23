/**
 * @file Pokemon 工具函数
 * @description 提供 Pokemon 卡片配置的查找和处理功能
 */

import pokemonData from '@/components/pokemon-css/data.json';

/**
 * Pokemon 卡片配置类型
 */
export interface PokemonConfig {
    id: string;
    name: string;
    supertype: string;
    subtypes: string[];
    number: string;
    rarity: string;
    images: {
        small: string;
        large: string;
    };
}

/**
 * 获取 Pokemon 卡片配置
 *
 * @param pokemonId - Pokemon ID，可为 null 或 undefined
 * @returns Pokemon 配置对象，如果 ID 无效则返回 null
 *
 * @example
 * ```ts
 * const config = getPokemonConfig('pgo-24');
 * // => { id: 'pgo-24', name: 'Holo', ... }
 *
 * const nullConfig = getPokemonConfig(null);
 * // => null
 * ```
 */
export function getPokemonConfig(pokemonId: string | null | undefined): PokemonConfig | null {
    if (!pokemonId) return null;
    return (pokemonData as PokemonConfig[]).find(p => p.id === pokemonId) || (pokemonData as PokemonConfig[])[0];
}

/**
 * 获取 Pokemon 卡片配置，当 ID 无效时返回默认配置
 *
 * @param pokemonId - Pokemon ID
 * @returns Pokemon 配置对象，始终返回有效配置
 *
 * @example
 * ```ts
 * const config = getPokemonConfigWithDefault('pgo-24');
 * // => { id: 'pgo-24', name: 'Holo', ... }
 *
 * const defaultConfig = getPokemonConfigWithDefault('invalid-id');
 * // => { id: 'pgo-24', name: 'Holo', ... } (第一个配置)
 * ```
 */
export function getPokemonConfigWithDefault(pokemonId: string): PokemonConfig {
    return (pokemonData as PokemonConfig[]).find(p => p.id === pokemonId) || (pokemonData as PokemonConfig[])[0];
}

/**
 * 获取所有 Pokemon 卡片配置
 */
export function getAllPokemonConfigs(): PokemonConfig[] {
    return pokemonData as PokemonConfig[];
}

/**
 * 获取默认 Pokemon 卡片配置
 */
export function getDefaultPokemonConfig(): PokemonConfig {
    return (pokemonData as PokemonConfig[])[0];
}
