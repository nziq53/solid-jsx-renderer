import { ESTree } from 'meriyah';
import { evalIdentifierBinding, setBinding } from './bind';
import { JSXContext } from './context';
import { Definition, evalMethodDefinition, evalPropertyDefinition } from './definition';
import { evalExpression, evalFunctionExpression } from './expression';
import { AnyFunction } from './options';

export const evalClassDeclaration = (declaration: ESTree.ClassDeclaration, context: JSXContext, binding: any) => {
  const constructor = evalClassDeclarationBase(declaration, context, binding);

  if (declaration.id) {
    const binding = evalIdentifierBinding(declaration.id, context);
    setBinding(binding, constructor, context, 'const');
  }
  return constructor;
};

export const evalClassExpression = (expression: ESTree.ClassExpression, context: JSXContext, binding: any) => {
  return evalClassDeclarationBase(expression, context, binding);
};

export const evalClassDeclarationBase = (base: ESTree.ClassDeclaration | ESTree.ClassExpression, context: JSXContext, binding: any) => {
  let constructor: AnyFunction = function () { };
  const klass = function (this: any, ...args: any[]) {
    context.pushStack(this);
    constructor.call(this, ...args);
    context.popStack();
  };

  for (const stmt of base.body.body) {
    let definition: Definition | AnyFunction | undefined;
    switch (stmt.type) {
      case 'PropertyDefinition':
        definition = evalPropertyDefinition(stmt, context, binding);
        break;
      default: {
        definition = evalClassElement(stmt as any, context, binding);
      }
    }

    if (!definition) break;
    if (typeof definition === 'function') {
      // noop
    } else {
      const target = definition.static ? klass : klass.prototype;
      const descripter = Object.getOwnPropertyDescriptor(target, definition.key);
      switch (definition.kind) {
        case 'constructor':
          constructor = definition.value;
          break;
        case 'method':
          Object.defineProperty(target, definition.key, { configurable: false, enumerable: false, value: definition.value });
          break;
        case 'get':
          Object.defineProperty(target, definition.key, { ...(descripter || {}), configurable: true, enumerable: true, get: definition.value });
          break;
        case 'set':
          Object.defineProperty(target, definition.key, { ...(descripter || {}), configurable: true, enumerable: true, set: definition.value });
          break;
        case 'property':
          Object.defineProperty(target, definition.key, { ...(descripter || {}), configurable: true, enumerable: true, writable: true, value: definition.value });
          break;
      }
    }
  }

  if (base.superClass) {
    const superClass = evalExpression(base.superClass, context, binding);
    Object.setPrototypeOf(klass, Object.getPrototypeOf(superClass));

    Object.defineProperty(klass, 'super', { enumerable: false, writable: true, value: superClass });
  }
  Object.defineProperty(klass.prototype, 'constructor', { enumerable: false, writable: true, value: klass });

  if (base.id) {
    Object.defineProperty(klass, 'name', { enumerable: false, configurable: true, writable: false, value: base.id.name });
  }

  return klass;
};

export const evalClassElement = (element: ESTree.ClassElement, context: JSXContext, binding: any) => {
  switch (element.type) {
    case 'FunctionExpression': {
      return evalFunctionExpression(element, context, binding);
    }
    case 'MethodDefinition':
      return evalMethodDefinition(element, context, binding);
  }
};
