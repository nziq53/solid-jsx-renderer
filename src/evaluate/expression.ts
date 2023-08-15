import { ESTree } from 'meriyah';
import { JSXComponent, JSXElement, JSXFragment, JSXNode, JSXNodeFunc, JSXProperties, JSXText } from '../types/node';
import { evalArrayPattern, evalBindingPattern, evalObjectPattern, evalRestElement, setBinding } from './bind';
import { evalClassDeclaration, evalClassExpression } from './class';
import { JSXContext } from './context';
import { evalMethodDefinition } from './definition';
import { JSXEvaluateError, wrapJSXError } from './error';
import { bindFunction, evalFunction } from './function';
import { JSX } from 'solid-js';

export const evalExpression = (exp: ESTree.Expression, context: JSXContext, binding: any): any => {
  try {
    console.log(exp)
    console.log(context.stack.variables)

    switch (exp.type) {
      case 'ArrayExpression':
        return evalArrayExpression(exp, context, binding);
      case 'ArrayPattern':
        return evalArrayPattern(exp, context);
      case 'ArrowFunctionExpression':
        return evalArrowFunctionExpression(exp, context, binding);
      case 'AssignmentExpression':
        return evalAssignmentExpression(exp, context, binding);
      case 'AwaitExpression':
        return evalAwaitExpression(exp, context);
      case 'BinaryExpression':
        return evalBinaryExpression(exp, context, binding);
      case 'CallExpression':
        return evalCallExpression(exp, context, binding);
      case 'ChainExpression':
        return evalChainExpression(exp, context, binding);
      case 'ClassDeclaration':
        return evalClassDeclaration(exp, context, binding);
      case 'ClassExpression':
        return evalClassExpression(exp, context, binding);
      case 'ConditionalExpression':
        return evalConditionalExpression(exp, context, binding);
      case 'FunctionExpression':
        return evalFunctionExpression(exp, context, binding);
      case 'Identifier':
        return evalIdentifier(exp, context, binding);
      case 'Import':
        return evalImport(exp, context);
      case 'ImportExpression':
        return evalImportExpression(exp, context);
      case 'JSXClosingElement':
        return evalJSXClosingElement(exp, context);
      case 'JSXClosingFragment':
        return evalJSXClosingFragment(exp, context);
      case 'JSXElement':
        return evalJSXElement(exp, context, binding);
      case 'JSXExpressionContainer':
        return evalJSXExpressionContainer(exp, context, binding);
      case 'JSXFragment':
        return evalJSXFragment(exp, context, binding);
      case 'JSXOpeningElement':
        return evalJSXOpeningElement(exp, context, binding);
      case 'JSXOpeningFragment':
        return evalJSXOpeningFragment(exp, context);
      case 'JSXSpreadChild':
        return evalJSXSpreadChild(exp, context, binding);
      case 'Literal':
        return evalLiteral(exp, context);
      case 'LogicalExpression':
        return evalLogicalExpression(exp, context, binding);
      case 'MemberExpression':
        return evalMemberExpression(exp, context, binding);
      case 'MetaProperty':
        return evalMetaProperty(exp, context, binding);
      case 'NewExpression':
        return evalNewExpression(exp, context, binding);
      case 'ObjectExpression':
        return evalObjectExpression(exp, context, binding);
      case 'ObjectPattern':
        return evalObjectPattern(exp, context);
      case 'RestElement':
        return evalRestElement(exp, context);
      case 'SequenceExpression':
        return evalSequenceExpression(exp, context, binding);
      case 'SpreadElement':
        return evalSpreadElement(exp, context, binding);
      case 'Super':
        return evalSuper(exp, context);
      case 'TaggedTemplateExpression':
        return evalTaggedTemplateExpression(exp, context, binding);
      case 'TemplateLiteral':
        return evalTemplateLiteral(exp, context, binding);
      case 'ThisExpression':
        return evalThisExpression(exp, context);
      case 'UnaryExpression':
        return evalUnaryExpression(exp, context, binding);
      case 'UpdateExpression':
        return evalUpdateExpression(exp, context);
      case 'YieldExpression':
        return evalYieldExpression(exp, context);
      default:
        throw new JSXEvaluateError('Not implemented expression', exp, context);
    }
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalArrayExpression = (exp: ESTree.ArrayExpression, context: JSXContext, binding: any): Array<any> => {
  return exp.elements.map((element) => (element ? evalExpression(element, context, binding) : null));
};

export const evalArrowFunctionExpression = (exp: ESTree.ArrowFunctionExpression, context: JSXContext, binding: any) => {
  const self = context.resolveThis();
  const func = bindFunction(evalFunction(exp, context, binding)[1], self, context);

  if (context.options.allowUserDefinedFunction && context.hasAllowedFunctions) {
    context.allowedFunctions.push(func);
  }

  return func;
};

export const evalAssignmentExpression = (exp: ESTree.AssignmentExpression, context: JSXContext, propbinding: any) => {
  const binding = evalBindingPattern(exp.left, context);

  const { operator } = exp;
  if (operator === '=') {
    const val = evalExpression(exp.right, context, propbinding);
    setBinding(binding, val, context);
    return val;
  } else {
    const val = evalBinaryExpression(
      {
        type: 'BinaryExpression',
        operator: operator.slice(0, operator.length - 1),
        left: exp.left,
        right: exp.right,
      },
      context,
      propbinding,
    );
    setBinding(binding, val, context);
    return val;
  }
};

export const evalAwaitExpression = (exp: ESTree.AwaitExpression, context: JSXContext) => {
  throw new JSXEvaluateError('await is not supported', exp, context);
};

export const evalBinaryExpression = (exp: ESTree.BinaryExpression, context: JSXContext, binding: any) => {
  const left = () => evalExpression(exp.left, context, binding);
  const right = () => evalExpression(exp.right, context, binding);
  switch (exp.operator) {
    case '+':
      return left() + right();
    case '-':
      return left() - right();
    case '/':
      return left() / right();
    case '*':
      return left() * right();
    case '%':
      return left() % right();
    case '**':
      return left() ** right();
    // relational operators
    case 'in':
      return left() in right();
    case 'instanceof':
      return left() instanceof right();
    case '<':
      return left() < right();
    case '>':
      return left() > right();
    case '<=':
      return left() <= right();
    case '>=':
      return left() >= right();
    // equality operators
    case '==':
      return left() == right();
    case '!=':
      return left() != right();
    case '===':
      return left() === right();
    case '!==':
      return left() !== right();
    // bitwise shift operators
    case '<<':
      return left() << right();
    case '>>':
      return left() >> right();
    case '>>>':
      return left() >>> right();
    // binary bitwise operators
    case '&':
      return left() & right();
    case '|':
      return left() | right();
    case '^':
      return left() ^ right();
    default:
      throw new JSXEvaluateError(`Unknown binary operator: ${exp.operator}`, exp, context);
  }
};

export const evalCallExpression = (exp: ESTree.CallExpression, context: JSXContext, binding: any) => {
  if (context.options.disableCall) return undefined;

  try {
    const callee = exp.callee as ESTree.Expression;
    const receiver = callee.type === 'MemberExpression' ? evalExpression(callee.object, context, binding) : context.resolveThis();
    const getName = (callee: ESTree.Expression | ESTree.PrivateIdentifier): any => {
      return callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? getName(callee.property) : null;
    };

    if (exp.optional && receiver === undefined) return undefined;

    const method = evalExpression(callee, context, binding) as (...args: any[]) => any;

    if (typeof method !== 'function') {
      throw new JSXEvaluateError(`${getName(callee) || 'f'} is not a function`, exp, context);
    }

    if (!context.isAllowedFunction(method)) {
      throw new JSXEvaluateError(`${getName(callee) || 'f'} is not allowed function`, exp, context);
    }

    const args = exp.arguments.map((arg) => evalExpression(arg, context, binding));
    // console.log(args)

    context.pushStack(receiver);
    const retval = method.call(receiver, ...args);
    context.popStack();
    return retval;
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalChainExpression = (exp: ESTree.ChainExpression, context: JSXContext, binding: any) => {
  return evalExpression(exp.expression, context, binding);
};

export const evalConditionalExpression = (exp: ESTree.ConditionalExpression, context: JSXContext, binding: any) => {
  return evalExpression(exp.test, context, binding) ? evalExpression(exp.consequent, context, binding) : evalExpression(exp.alternate, context, binding);
};

export const evalFunctionExpression = (exp: ESTree.FunctionExpression, context: JSXContext, binding: any) => {
  const func = evalFunction(exp, context, binding)[1];

  if (context.options.allowUserDefinedFunction && context.hasAllowedFunctions) {
    context.allowedFunctions.push(func);
  }

  return func;
};

export const evalIdentifier = (exp: ESTree.Identifier, context: JSXContext, binding: any) => {
  try {
    // console.log(exp.name)
    // console.log(binding[exp.name])
  } catch (e) {
    // console.log(e)
  }
  if (binding[exp.name]) {
    return binding[exp.name]
  }
  const variable = context.resolveIdentifier(exp.name);
  if (!variable) {
    if (context.options.raiseReferenceError) {
      throw new JSXEvaluateError(`${exp.name} is not defined`, exp, context);
    } else {
      return undefined;
    }
  }
  return variable.value;
};

export const evalImport = (exp: ESTree.Import, context: JSXContext) => {
  throw new JSXEvaluateError('import is not supported', exp, context);
};

export const evalImportExpression = (exp: ESTree.ImportExpression, context: JSXContext) => {
  throw new JSXEvaluateError('import is not supported', exp, context);
};

export const evalLiteral = (exp: ESTree.Literal, _context: JSXContext): ESTree.Literal['value'] => {
  return exp.value;
};

export const evalLogicalExpression = (exp: ESTree.LogicalExpression, context: JSXContext, binding: any) => {
  const left = () => evalExpression(exp.left, context, binding);
  const right = () => evalExpression(exp.right, context, binding);
  switch (exp.operator) {
    case '&&':
      return left() && right();
    case '||':
      return left() || right();
    case '??':
      return left() ?? right();
    default:
      throw new JSXEvaluateError(`Unknown logical operator: ${exp.operator}`, exp, context);
  }
};

export const evalMemberExpression = (exp: ESTree.MemberExpression, context: JSXContext, binding: any) => {
  try {
    const { object, property } = exp;

    const receiver = evalExpression(object, context, binding);
    const key = property.type === 'Identifier' ? property.name : property.type === 'PrivateIdentifier' ? property.name : evalExpression(property, context, binding);

    if (exp.optional && receiver === undefined) return undefined;

    context.pushStack(receiver);
    const retval = receiver[key];
    context.popStack();
    return retval;
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalMetaProperty = (exp: ESTree.MetaProperty, context: JSXContext, binding: any) => {
  throw new JSXEvaluateError('meta property is not supported', exp, context);
};

export const evalNewExpression = (exp: ESTree.NewExpression, context: JSXContext, binding: any) => {
  try {
    if (context.options.disableCall || context.options.disableNew) return undefined;

    const callee = evalExpression(exp.callee, context, binding);
    const arugments = exp.arguments.map((arg) => evalExpression(arg, context, binding));
    return new callee(...arugments);
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalObjectExpression = (exp: ESTree.ObjectExpression, context: JSXContext, binding: any) => {
  const object: Record<any, any> = {};
  exp.properties.forEach((property) => {
    evalObjectLiteralElementLike(object, property, context, binding);
  });
  return object;
};

export const evalSequenceExpression = (exp: ESTree.SequenceExpression, context: JSXContext, binding: any) => {
  return exp.expressions.reduce((_, e) => evalExpression(e, context, binding), undefined);
};

export const evalSpreadElement = (exp: ESTree.SpreadElement, context: JSXContext, binding: any) => {
  return evalExpression(exp.argument, context, binding);
};

export const evalSuper = (_: ESTree.Super, context: JSXContext) => {
  const ctor = context.resolveThis().constructor;
  return ctor.super;
};

export const evalTaggedTemplateExpression = (exp: ESTree.TaggedTemplateExpression, context: JSXContext, binding: any) => {
  const { quasi } = exp;
  const tag = evalExpression(exp.tag, context, binding);
  const quasis = quasi.quasis.map((q) => q.value.cooked);
  const expressions = quasi.expressions.map((e) => evalExpression(e, context, binding));
  return tag(quasis, ...expressions);
};

const getLocStart = (node: ESTree.Node) => {
  if (node.loc) return node.loc.start;
  return { line: 0, column: 0 };
};

export const evalTemplateLiteral = (exp: ESTree.TemplateLiteral, context: JSXContext, binding: any) => {
  return [...exp.expressions, ...exp.quasis]
    .sort((a, b) => {
      const aLoc = getLocStart(a);
      const bLoc = getLocStart(b);
      if (aLoc.line === bLoc.line) return aLoc.column - bLoc.column;
      return aLoc.line - bLoc.line;
    })
    .map((e) => {
      switch (e.type) {
        case 'TemplateElement':
          return e.value.cooked;
        default:
          return evalExpression(e, context, binding);
      }
    })
    .join('');
};

export const evalThisExpression = (_: ESTree.ThisExpression, context: JSXContext) => {
  return context.resolveThis();
};

export const evalUnaryExpression = (exp: ESTree.UnaryExpression, context: JSXContext, binding: any) => {
  switch (exp.operator) {
    case '+':
      return +evalExpression(exp.argument, context, binding);
    case '-':
      return -evalExpression(exp.argument, context, binding);
    case '~':
      return ~evalExpression(exp.argument, context, binding);
    case '!':
      return !evalExpression(exp.argument, context, binding);
    case 'void':
      return void evalExpression(exp.argument, context, binding);
    // case 'delete': return delete this.evalExpression(expression.argument);
    case 'typeof':
      return typeof evalExpression(exp.argument, context, binding);
    default:
      throw new JSXEvaluateError(`Unknown unary operator: ${exp.operator}`, exp, context);
  }
};

export const evalUpdateExpression = (exp: ESTree.UpdateExpression, context: JSXContext) => {
  const binding = evalBindingPattern(exp.argument, context);
  const current = evalExpression(exp.argument, context, binding);
  switch (exp.operator) {
    case '++':
      return setBinding(binding, current + 1, context);
    case '--':
      return setBinding(binding, current - 1, context);
    default:
      throw new JSXEvaluateError(`Unknown update operator: ${exp.operator}`, exp, context);
  }
};

export const evalYieldExpression = (exp: ESTree.YieldExpression, context: JSXContext) => {
  throw new JSXEvaluateError('yield is not supported', exp, context);
};

// ObjectLiteralElementLike

const evalObjectLiteralElementLike = (object: any, exp: ESTree.ObjectLiteralElementLike, context: JSXContext, binding: any) => {
  switch (exp.type) {
    case 'MethodDefinition':
      evalMethodDefinition(exp, context, binding);
      break;
    case 'Property': {
      evalProperty(object, exp, context, binding);
      break;
    }
    case 'SpreadElement': {
      Object.assign(object, evalSpreadElement(exp, context, binding));
      break;
    }
  }
};

export const evalProperty = (object: any, exp: ESTree.Property, context: JSXContext, binding: any) => {
  let key: any;
  if (exp.computed) {
    key = evalExpression(exp.key, context, binding);
  } else {
    switch (exp.key.type) {
      case 'Literal':
        key = evalLiteral(exp.key, context);
        break;
      case 'Identifier':
        key = exp.key.name;
        break;
    }
  }

  const value = ((exp: ESTree.Property['value']) => {
    switch (exp.type) {
      case 'AssignmentPattern':
      case 'ArrayPattern':
      case 'ObjectPattern':
        return undefined;
      default:
        return evalExpression(exp, context, binding);
    }
  })(exp.value);

  switch (exp.kind) {
    case 'init':
      object[key] = value;
      break;
    case 'get':
      Object.defineProperty(object, key, { get: bindFunction(value, object, context) });
      break;
    case 'set':
      Object.defineProperty(object, key, { set: bindFunction(value, object, context) });
      break;
  }
};

/// JSXChild

export const evalJSXChild = (jsx: ESTree.JSXChild, context: JSXContext, binding: any): JSXNode => {
  switch (jsx.type) {
    case 'JSXEmptyExpression':
      return evalJSXEmptyExpression(jsx, context);
    case 'JSXText':
      return evalJSXText(jsx, context);
    // case 'JSXElement': return evalJSXElement(jsx, context, binding);
    // case 'JSXExpressionContainer': return evalJSXExpressionContainer(jsx, context, binding);
    // case 'JSXFragment': return evalJSXFragment(jsx, context, binding);
    // case 'JSXSpreadChild': return evalJSXSpreadChild(jsx, context, binding);
    default:
      return evalExpression(jsx, context, binding);
  }
};

export const evalJSXElement = (jsx: ESTree.JSXElement, context: JSXContext, binding: any): JSXElement | JSX.Element => {
  const { openingElement } = jsx;
  const [component, properties] = evalExpression(openingElement, context, binding);
  const children = jsx.children.map((child) => {
    switch (child.type) {
      case 'JSXText': return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Literal')
      default: return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Node')
    }
  });

  jsx.closingElement && evalExpression(jsx.closingElement, context, binding);

  const { start: loc } = Object.assign({}, { start: undefined }, jsx.loc);

  return {
    type: 'element',
    component,
    props: properties,
    children,
    loc,
  };
};

export const evalJSXEmptyExpression = (_jsx: ESTree.JSXEmptyExpression, _context: JSXContext): JSXNode => {
  return undefined;
};

export const evalJSXSpreadChild = (jsx: ESTree.JSXSpreadChild, context: JSXContext, binding: any): JSXFragment | JSX.Element | undefined => {
  const { expression } = jsx;
  const fragment = evalJSXFragment(
    {
      type: 'JSXFragment',
      openingFragment: {
        type: 'JSXOpeningFragment',
      },
      closingFragment: {
        type: 'JSXClosingFragment',
      },
      children: [],
    },
    context,
    binding,
  );

  fragment.children = Array.from(evalJSXExpressionContainer({ type: 'JSXExpressionContainer', expression }, context, binding));
  return fragment;
};

export const evalJSXExpressionContainer = (jsx: ESTree.JSXExpressionContainer, context: JSXContext, binding: any): any => {
  const { expression } = jsx;
  switch (expression.type) {
    case 'JSXEmptyExpression':
      return evalJSXEmptyExpression(expression, context);
    default:
      return evalExpression(expression, context, binding);
  }
};

export const evalJSXFragment = (jsx: ESTree.JSXFragment, context: JSXContext, binding: any): JSXFragment => {
  const { openingFragment } = jsx;
  const [, properties] = evalExpression(openingFragment, context, binding);
  const children = jsx.children.map((child) => {
    switch (child.type) {
      case 'JSXText': return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Literal')
      default: return new JSXNodeFunc((binding: any, ctx: JSXContext) => evalJSXChild(child, ctx, binding), 'Node')
    }
  });
  evalExpression(jsx.closingFragment, context, binding);

  const { start: loc } = Object.assign({}, { start: undefined }, jsx.loc);

  return {
    type: 'fragment',
    props: properties,
    children,
    loc,
  };
};

export const evalJSXText = (jsx: ESTree.JSXText, _context: JSXContext): JSXText => {
  return jsx.value;
};

export const evalJSXClosingElement = (_jsx: ESTree.JSXClosingElement, context: JSXContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXClosingFragment = (_jsx: ESTree.JSXClosingFragment, context: JSXContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXOpeningElement = (jsx: ESTree.JSXOpeningElement, context: JSXContext, binding: any): [JSXComponent, JSXProperties] => {
  // console.log("context")
  // console.log(context.stack.variables)

  const { attributes } = jsx;

  const name = evalJSXTagNameExpression(jsx.name, context, binding);

  const component = context.resolveComponent(name);

  const properties: JSXProperties = {};
  attributes.forEach((attribute) => {
    switch (attribute.type) {
      case 'JSXAttribute': {
        const [key, value] = evalJSXAttribute(attribute, context, binding);

        properties[key] = value;
        break;
      }
      case 'JSXSpreadAttribute': {
        Object.assign(properties, evalJSXSpreadAttribute(attribute, context, binding));
        break;
      }
    }
  });
  if (!context.options.disableKeyGeneration && properties['key'] === undefined) {
    const key = context.keyGenerator.generate();
    properties['key'] = key
  }

  context.keyGenerator.openingElement();
  if (jsx.selfClosing) context.keyGenerator.closingElement();
  return [component, properties];
};

export const evalJSXOpeningFragment = (_jsx: ESTree.JSXOpeningFragment, context: JSXContext): [undefined, JSXProperties] => {
  const properties: JSXProperties = {};

  if (!context.options.disableKeyGeneration && properties['key'] === undefined) {
    properties['key'] = context.keyGenerator.generate();
  }

  context.keyGenerator.openingElement();
  return [undefined, properties];
};

/// JSXTagNameExpression

export const evalJSXTagNameExpression = (jsx: ESTree.JSXTagNameExpression, context: JSXContext, binding: any): string => {
  switch (jsx.type) {
    case 'JSXIdentifier':
      return evalJSXIdentifier(jsx, context);
    case 'JSXMemberExpression':
      return evalJSXMemberExpression(jsx, context, binding);
    case 'JSXNamespacedName':
      return evalJSXNamespacedName(jsx, context, binding);
  }
};

export const evalJSXIdentifier = (jsx: ESTree.JSXIdentifier, _context: JSXContext): string => {
  const { name } = jsx;
  return name;
};

export const evalJSXMemberExpression = (jsx: ESTree.JSXMemberExpression, context: JSXContext, binding: any): string => {
  const { object, property } = jsx;
  return `${evalJSXTagNameExpression(object, context, binding)}.${evalJSXIdentifier(property, context)}`;
};

export const evalJSXNamespacedName = (jsx: ESTree.JSXNamespacedName, context: JSXContext, binding: any): string => {
  const { namespace, name } = jsx;
  return `${evalJSXTagNameExpression(namespace, context, binding)}:${evalJSXIdentifier(name, context)}`;
};

/// JSXAttribute

export const evalJSXAttribute = (jsx: ESTree.JSXAttribute, context: JSXContext, binding: any): [string, any] => {
  const name = evalJSXTagNameExpression(jsx.name, context, binding);
  const value = evalJSXAttributeValue(jsx.value, context, binding);
  return [name, value];
};

export const evalJSXSpreadAttribute = (jsx: ESTree.JSXSpreadAttribute, context: JSXContext, binding: any) => {
  return evalExpression(jsx.argument, context, binding);
};

/// JSXAttributeValue

export const evalJSXAttributeValue = (jsx: ESTree.JSXAttributeValue, context: JSXContext, binding: any) => {
  if (!jsx) return true;

  switch (jsx.type) {
    case 'JSXIdentifier':
      return evalJSXIdentifier(jsx, context);
    case 'Literal':
      return evalLiteral(jsx, context);
    case 'JSXElement':
      return evalJSXElement(jsx, context, binding);
    case 'JSXFragment':
      return evalJSXFragment(jsx, context, binding);
    case 'JSXExpressionContainer':
      return evalJSXExpressionContainer(jsx, context, binding);
    case 'JSXSpreadChild':
      return evalJSXSpreadChild(jsx, context, binding);
  }
};
