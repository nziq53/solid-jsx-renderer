# solid-jsx-renderer

## Description
SolidJS JSX Renderer is a SolidJS Component for rendering JSX to SolidJS nodes.

It has a JavaScript Runtime inside, and can execute the user's JSX with controlled behavior.

[Launch Demo](https://oligami-0424.github.io/solid-jsx-renderer/)

## Features
- [x] Rendering JSX as SolidJS node
- [x] TypeScritpt ready
- [x] Provides CommonJS and ES Modules
- [x] JavaScript syntax and featues
  - without async, await and generator
- [x] Injectable custom SolidJS components
- [x] Pass binding variables
- [x] Applicable filters to parsed nodes
  - You can create allowlist / denylist filters to tagName, attributes or properties
  - Operation has not been checked.
- [x] Avoid user's call expressions
- [x] Avoid user's new expressions
- [x] Parse with meriyah
## My Features
- [x] Can use on SSR(solid-start)
- [x] Binding Component SSR
  - binding Component which has binding props is also ssr on internal
  - `<textarea value={signal()}>` is not ssr on solid-start. You should use `<textarea>{signal()}</textarea>`
- [x] Update only what is updated.
- [ ] can use Show, For, Index ... (only SolidJS Component)
  - A is now enable (Confirmed)
  - For, Index, Show is now able (Special)
  - others (not confirmed)
- [ ] can style property
  `<div style={{}} />`

If there is a feature you want, please contact us at issue

Ported from:
[https://github.com/rosylilly/react-jsx-renderer](https://github.com/rosylilly/react-jsx-renderer) v1.3.1
See here for detailed instructions.

[This is sample code](https://github.com/oligami-0424/solid-jsx-renderer/tree/main/examples/solidjs)

## Installation

1. `npm install @oligami/solid-jsx-renderer` (or `pnpm add @oligami/solid-jsx-renderer`)
2. Add `import { JSXRenderer } from 'solid-jsx-renderer';`
3. `<JSXRenderer code="Hello, World" />` to render `Hello, World`

## Requirements

- **SolidJS**: latest
- **solid-start**: latest

## Options

disableKeyGeneration:
  This doesn't make any sense, so it would be lighter to turn it off.

disableSolidJSComponents: 
  disbale <For />, <Index />, <Show />


## !!

- ContextProviderで囲って値を渡したときはリアクティブではありません
