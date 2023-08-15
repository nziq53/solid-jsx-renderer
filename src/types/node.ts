import { JSXContext } from 'evaluate';
import { ESTree } from 'meriyah';

export type JSXComponent = string | any;

export type JSXProperties = Record<string, any>;

export interface JSXChild {
  props: JSXProperties;
  children: JSXNodeFunc[];
}

export interface JSXElement extends JSXChild {
  type: 'element';
  component: JSXComponent;
  loc?: ESTree.Position;
}

export interface JSXFragment extends JSXChild {
  type: 'fragment';
  loc?: ESTree.Position;
}

export type JSXText = string | number;

export type JSXNode = JSXElement | JSXFragment | JSXText | boolean | null | undefined;

type JSXNodeTypes = 'Node' | 'Literal'

export class JSXNodeFunc {
  func: (ctx: JSXContext) => JSXNode
  type: JSXNodeTypes

  constructor(node: (ctx: JSXContext) => JSXNode, type: JSXNodeTypes) {
    this.func = node
    this.type = type
  }

  isJSXLiteralFunc(): this is {
    func: (ctx: JSXContext) => JSXText | boolean | null | undefined
    type: JSXNodeTypes
  } {
    if (this.type === 'Literal')
      return true
    return false
  }
}

export interface JSXLiteralFunc extends JSXNodeFunc {
  type: 'Literal'
  func: (ctx: JSXContext) => JSXText | boolean | null | undefined
}

export interface JSXElementFunc extends JSXNodeFunc {
  type: 'Node'
  func: (ctx: JSXContext) => JSXElement | JSXFragment
}