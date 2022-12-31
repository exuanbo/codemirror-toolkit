import type { EditorState, Extension } from '@codemirror/state'
import { Compartment, Facet } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

const ExtensionsCompartment = /*#__PURE__*/ new Compartment()

function updateExtensions(view: EditorView, extensions: Extension[]): void {
  view.dispatch({
    effects: ExtensionsCompartment.reconfigure(extensions),
  })
}

type ExtensionSet = Set<Extension>

const ExtensionSetFacet = /*#__PURE__*/ Facet.define<ExtensionSet, ExtensionSet | null>({
  combine(values) {
    return values.length ? values[0] : null
  },
  static: true,
})

export function extensionManager(...initialExtensions: Extension[]): Extension {
  return [
    ExtensionsCompartment.of(initialExtensions),
    ExtensionSetFacet.of(new Set(initialExtensions)),
  ]
}

export type FlatExtension = Exclude<Extension, readonly Extension[]>

export function wrapExtension(extension: Extension): FlatExtension {
  return { extension }
}

function getExtensionSet(state: EditorState): ExtensionSet {
  const extensionSet = state.facet(ExtensionSetFacet)
  if (!extensionSet) {
    throw new Error('extensionManager extension is not enabled')
  }
  return extensionSet
}

function isExtensionArray(extension: Extension): extension is readonly Extension[] {
  return Array.isArray(extension)
}

function flattenExtensions(extensions: readonly Extension[], depth: number): readonly Extension[] {
  if (depth <= 0) {
    return extensions
  }
  return extensions.flatMap(extension => {
    if (!isExtensionArray(extension)) {
      return extension
    }
    return flattenExtensions(extension, depth - 1)
  })
}

export interface ExtensionOptions {
  flattenDepth?: number
}

export type RemoveExtension = () => void

export function addExtension(
  view: EditorView,
  extension: Extension,
  { flattenDepth = 0 }: ExtensionOptions = {},
): RemoveExtension {
  const extensionSet = getExtensionSet(view.state)
  const flattenedExtensions = flattenExtensions([extension], flattenDepth)
  let hasAdded = false
  for (const ext of flattenedExtensions) {
    if (!extensionSet.has(ext)) {
      extensionSet.add(ext)
      hasAdded = true
    }
  }
  if (hasAdded) {
    updateExtensions(view, [...extensionSet])
  }
  return () => {
    removeExtension(view, flattenedExtensions, { flattenDepth: 1 })
  }
}

export function removeExtension(
  view: EditorView,
  extension: Extension,
  { flattenDepth = 0 }: ExtensionOptions = {},
): void {
  const extensionSet = getExtensionSet(view.state)
  const flattenedExtensions = flattenExtensions([extension], flattenDepth)
  let hasRemoved = false
  for (const ext of flattenedExtensions) {
    if (extensionSet.delete(ext)) {
      hasRemoved = true
    }
  }
  if (hasRemoved) {
    updateExtensions(view, [...extensionSet])
  }
}

export function clearExtensions(view: EditorView): void {
  const extensionSet = getExtensionSet(view.state)
  if (extensionSet.size) {
    extensionSet.clear()
    updateExtensions(view, [])
  }
}

export function hasExtension(view: EditorView, extension: Extension): boolean {
  const extensionSet = getExtensionSet(view.state)
  return extensionSet.has(extension)
}
