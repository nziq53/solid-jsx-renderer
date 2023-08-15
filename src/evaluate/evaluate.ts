import { ESTree, Options, parseModule } from 'meriyah';
import { JSXNode, JSXNodeFunc } from '../types/node';
import { JSXContext } from './context';
import { evalJSXChild } from './expression';
import { EvaluateOptions, ParseOptions } from './options';
import { evalProgram } from './program';
import { createEffect } from 'solid-js';

const meriyahForceOptions: Options = {
  module: true,
  jsx: true,
  loc: true,
};

export const parse = (code: string, options: ParseOptions): ESTree.Program => {
  const { meriyah, debug, forceExpression } = options;

  try {
    const parserOptions = Object.assign({}, meriyah || {}, meriyahForceOptions);
    debug && console.time('JSX parse');
    const program = parseModule(forceExpression ? `<>${code}</>` : code, parserOptions);
    return program;
  } finally {
    debug && console.timeEnd('JSX parse');
  }
};

type EvaluateFunction<T> = {
  (program: ESTree.Program, options?: EvaluateOptions): T;
  (program: string, options?: ParseOptions & EvaluateOptions): T;
};

export const evaluate: EvaluateFunction<JSXContext> = (program: ESTree.Program | string, options: ParseOptions & EvaluateOptions = {}): JSXContext => {
  if (typeof program === 'string') program = parse(program, options);

  const context = new JSXContext(options);
  try {
    options.debug && console.time('JSX eval ');
    evalProgram(program, context);
    return context;
  } finally {
    options.debug && console.timeEnd('JSX eval ');
  }
};

export const evaluateJSX: EvaluateFunction<JSXNodeFunc[]> = (program: ESTree.Program | string, options: ParseOptions & EvaluateOptions = {}): JSXNodeFunc[] => {

  if (typeof program === 'string') program = parse(program, { ...options, forceExpression: true });

  const [fragmentExpression] = program.body;
  if (!fragmentExpression || fragmentExpression.type !== 'ExpressionStatement') {
    return [];
  }

  const fragment = fragmentExpression.expression;
  if (!fragment || fragment.type !== 'JSXFragment') {
    return [];
  }

  try {
    options.debug && console.time('JSX eval ');
    const nodes = fragment.children.map((child) => {
      switch (child.type) {
        case 'JSXText': return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Literal')
        default: return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Node')
      }
    });
    return nodes;
  } finally {
    options.debug && console.timeEnd('JSX eval ');
  }
};
