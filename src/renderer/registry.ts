import type { BlockComponent, RegistryEntry } from './types'

/**
 * BlockRegistry — maps block slugs to their React component implementations.
 *
 * Usage:
 *   import { registry } from '@/renderer/registry'
 *   registry.register('hero-banner', HeroBannerBlock)
 *   const Component = registry.get('hero-banner')
 */
class BlockRegistry {
  private readonly entries = new Map<string, RegistryEntry>()

  /**
   * Register a component for a block slug.
   * Call this in your app's initialisation code (e.g. a registry setup file).
   */
  register(slug: string, component: BlockComponent, displayName?: string): void {
    if (!slug || typeof slug !== 'string') {
      throw new Error('BlockRegistry.register: slug must be a non-empty string.')
    }
    if (this.entries.has(slug)) {
      // Allow re-registration (e.g. during HMR) but log a warning in dev
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[BlockRegistry] Re-registering component for slug "${slug}".`)
      }
    }
    this.entries.set(slug, { component, displayName: displayName ?? slug })
  }

  /**
   * Returns the component for the given slug, or undefined if not registered.
   */
  get(slug: string): BlockComponent | undefined {
    return this.entries.get(slug)?.component
  }

  /**
   * Returns true if a component is registered for the given slug.
   */
  has(slug: string): boolean {
    return this.entries.has(slug)
  }

  /**
   * Unregister a block component (useful in tests or storybook).
   */
  unregister(slug: string): void {
    this.entries.delete(slug)
  }

  /**
   * List all registered slugs.
   */
  list(): string[] {
    return Array.from(this.entries.keys())
  }

  /**
   * Register multiple components at once.
   */
  registerMany(map: Record<string, BlockComponent>): void {
    for (const [slug, component] of Object.entries(map)) {
      this.register(slug, component)
    }
  }
}

// Singleton instance shared across the application
export const registry = new BlockRegistry()
