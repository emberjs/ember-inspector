/* eslint-disable no-undef */
/* eslint-disable ember/no-private-routing-service */
/**
 * Ember Inspector API - Stub Implementation
 *
 * This file demonstrates what the proposed public API from ember-source
 * would look like when accessed via appLoader.loadCompatInspector()
 *
 * In production, this would be provided by ember-source, not the inspector.
 * The inspector would access it via:
 *
 *   const api = globalThis.emberInspectorApps[0].loadCompatInspector();
 *
 * This stub shows the interface that ember-source should implement.
 */

/**
 * STUB: This would be provided by ember-source
 *
 * For now, this falls back to the old implementation to maintain compatibility.
 * Once ember-source implements the API, this file can be removed.
 */
export const emberInspectorAPI = await globalThis.emberInspectorApps[0].loadCompatInspector();
