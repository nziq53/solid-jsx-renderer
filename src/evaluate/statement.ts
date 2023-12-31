import { ESTree } from 'meriyah';
import { Binding, evalBindingPattern, setBinding } from './bind';
import { evalClassDeclaration, evalClassExpression } from './class';
import { JSXContext } from './context';
import { JSXBreak, JSXContinue, JSXEvaluateError, JSXReturn } from './error';
import { evalExpression } from './expression';
import { evalFunction } from './function';

export const evalStatement = (stmt: ESTree.Statement, context: JSXContext) => {
  switch (stmt.type) {
    case 'BlockStatement':
      return evalBlockStatement(stmt, context);
    case 'BreakStatement':
      return evalBreakStatement(stmt, context);
    case 'ClassDeclaration':
      return evalClassDeclaration(stmt, context);
    case 'ClassExpression':
      return evalClassExpression(stmt, context);
    case 'ContinueStatement':
      return evalContinueStatement(stmt, context);
    case 'DebuggerStatement':
      return evalDebuggerStatement(stmt, context);
    case 'DoWhileStatement':
      return evalDoWhileStatement(stmt, context);
    case 'EmptyStatement':
      return evalEmptyStatement(stmt, context);
    case 'ExportAllDeclaration':
      return evalExportAllDeclaration(stmt, context);
    case 'ExportDefaultDeclaration':
      return evalExportDefaultDeclaration(stmt, context);
    case 'ExportNamedDeclaration':
      return evalExportNamedDeclaration(stmt, context);
    case 'ExpressionStatement':
      return evalExpressionStatement(stmt, context);
    case 'ForInStatement':
      return evalForInStatement(stmt, context);
    case 'ForOfStatement':
      return evalForOfStatement(stmt, context);
    case 'ForStatement':
      return evalForStatement(stmt, context);
    case 'FunctionDeclaration':
      return evalFunctionDeclaration(stmt, context);
    case 'IfStatement':
      return evalIfStatement(stmt, context);
    case 'ImportDeclaration':
      return evalImportDeclaration(stmt, context);
    case 'LabeledStatement':
      return evalLabeledStatement(stmt, context);
    case 'ReturnStatement':
      return evalReturnStatement(stmt, context);
    case 'SwitchStatement':
      return evalSwitchStatement(stmt, context);
    case 'ThrowStatement':
      return evalThrowStatement(stmt, context);
    case 'TryStatement':
      return evalTryStatement(stmt, context);
    case 'VariableDeclaration':
      return evalVariableDeclaration(stmt, context);
    case 'WhileStatement':
      return evalWhileStatement(stmt, context);
    case 'WithStatement':
      return evalWithStatement(stmt, context);
    default:
      throw new JSXEvaluateError('Not implemented statement', stmt, context);
  }
};

export const evalBlockStatement = (stmt: ESTree.BlockStatement, context: JSXContext) => {
  const label = context.label;

  for (const child of stmt.body) {
    try {
      evalStatement(child, context);
    } catch (err) {
      if (label) {
        if (err instanceof JSXBreak) {
          if (err.isLabeled) {
            if (err.label === label) {
              break;
            } else {
              throw err;
            }
          } else {
            break;
          }
        }
      }
      throw err;
    }
  }
};

export const evalBreakStatement = (stmt: ESTree.BreakStatement, __: JSXContext) => {
  throw new JSXBreak(stmt.label ? stmt.label.name : undefined);
};

export const evalContinueStatement = (stmt: ESTree.ContinueStatement, __: JSXContext) => {
  throw new JSXContinue(stmt.label ? stmt.label.name : undefined);
};

export const evalDebuggerStatement = (_: ESTree.DebuggerStatement, __: JSXContext) => {
  // eslint-disable-next-line no-debugger
  debugger;
};

export const evalDoWhileStatement = (stmt: ESTree.DoWhileStatement, context: JSXContext) => {
  const label = context.label;

  do {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      } else if (err instanceof JSXContinue) {
        if (err.isLabeled) {
          if (err.label === label) {
            continue;
          } else {
            throw err;
          }
        } else {
          continue;
        }
      }
      throw err;
    }
  } while (evalExpression(stmt.test, context));
};

export const evalEmptyStatement = (_: ESTree.EmptyStatement, __: JSXContext) => { };

export const evalExportAllDeclaration = (stmt: ESTree.ExportAllDeclaration, context: JSXContext) => {
  throw new JSXEvaluateError('export all is not supported', stmt, context);
};

export const evalExportDefaultDeclaration = (stmt: ESTree.ExportDefaultDeclaration, context: JSXContext) => {
  const value = (() => {
    switch (stmt.declaration.type) {
      case 'FunctionDeclaration':
        return evalFunctionDeclaration(stmt.declaration, context);
      case 'VariableDeclaration':
        return evalVariableDeclaration(stmt.declaration, context);
      default:
        return evalExpression(stmt.declaration, context);
    }
  })();
  context.export('default', value);
};

export const evalExportNamedDeclaration = (stmt: ESTree.ExportNamedDeclaration, context: JSXContext) => {
  stmt.specifiers.map((specifier) => {
    context.export(specifier.exported.name, evalExpression(specifier.local, context));
  });

  if (!stmt.declaration) return undefined;

  switch (stmt.declaration.type) {
    case 'FunctionDeclaration': {
      const [bind, func] = evalFunctionDeclaration(stmt.declaration, context);
      if (bind) {
        context.export(bind.name, func);
      }
      break;
    }
    case 'VariableDeclaration': {
      const binds = evalVariableDeclaration(stmt.declaration, context);
      const exportBind = (bind: Binding): any => {
        switch (bind.type) {
          case 'Identifier':
            return context.export(bind.name, evalExpression(bind, context));
          case 'Object':
            return Object.values(bind.binds).map((b) => exportBind(b));
          case 'Array':
            return bind.binds.map((bind) => bind && exportBind(bind));
        }
      };
      return binds.forEach((bind) => exportBind(bind));
    }
    default:
      return evalExpression(stmt.declaration, context);
  }
};

export const evalExpressionStatement = (stmt: ESTree.ExpressionStatement, context: JSXContext) => {
  evalExpression(stmt.expression, context);
};

export const evalForInStatement = (stmt: ESTree.ForInStatement, context: JSXContext) => {
  const label = context.label;
  const right = evalExpression(stmt.right, context);

  context.pushStack(context.resolveThis());
  for (const iter in right) {
    context.popStack();
    context.pushStack(context.resolveThis());

    switch (stmt.left.type) {
      case 'VariableDeclaration': {
        const [bind] = stmt.left.declarations.map((dec) => evalBindingPattern(dec.id, context));
        if (bind) {
          setBinding(bind, iter, context, stmt.left.kind);
        }
        break;
      }
      default:
        evalExpression(stmt.left, context);
    }

    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      } else if (err instanceof JSXContinue) {
        if (err.isLabeled) {
          if (err.label === label) {
            continue;
          } else {
            throw err;
          }
        } else {
          continue;
        }
      }
      throw err;
    }
  }
  context.popStack();
};

export const evalForOfStatement = (stmt: ESTree.ForOfStatement, context: JSXContext) => {
  const label = context.label;
  const right = evalExpression(stmt.right, context);

  context.pushStack(context.resolveThis());
  for (const iter of right) {
    context.popStack();
    context.pushStack(context.resolveThis());

    switch (stmt.left.type) {
      case 'VariableDeclaration': {
        const [bind] = stmt.left.declarations.map((dec) => evalBindingPattern(dec.id, context));
        if (bind) {
          setBinding(bind, iter, context, stmt.left.kind);
        }
        break;
      }
      default:
        evalExpression(stmt.left, context);
    }

    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      } else if (err instanceof JSXContinue) {
        if (err.isLabeled) {
          if (err.label === label) {
            continue;
          } else {
            throw err;
          }
        } else {
          continue;
        }
      }
      throw err;
    }
  }
  context.popStack();
};

export const evalForStatement = (stmt: ESTree.ForStatement, context: JSXContext) => {
  const label = context.label;
  context.pushStack(context.resolveThis());
  const init = () => {
    if (stmt.init) {
      switch (stmt.init.type) {
        case 'VariableDeclaration':
          evalVariableDeclaration(stmt.init, context);
          break;
        default:
          evalExpression(stmt.init, context);
      }
    }
  };
  const test = () => {
    return stmt.test ? evalExpression(stmt.test, context) : true;
  };
  const update = () => {
    stmt.update && evalExpression(stmt.update, context);
  };

  for (init(); test(); update()) {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      } else if (err instanceof JSXContinue) {
        if (err.isLabeled) {
          if (err.label === label) {
            continue;
          } else {
            throw err;
          }
        } else {
          continue;
        }
      }
      throw err;
    }
  }
  context.popStack();
};

export const evalFunctionDeclaration = (stmt: ESTree.FunctionDeclaration, context: JSXContext) => {
  return evalFunction(stmt, context);
};

export const evalIfStatement = (stmt: ESTree.IfStatement, context: JSXContext) => {
  if (evalExpression(stmt.test, context)) {
    evalStatement(stmt.consequent, context);
  } else {
    stmt.alternate && evalStatement(stmt.alternate, context);
  }
};

export const evalImportDeclaration = (stmt: ESTree.ImportDeclaration, context: JSXContext) => {
  throw new JSXEvaluateError('import is not supported', stmt, context);
};

export const evalLabeledStatement = (stmt: ESTree.LabeledStatement, context: JSXContext) => {
  context.label = stmt.label.name;
  evalStatement(stmt.body, context);
  context.label = undefined;
};

export const evalReturnStatement = (stmt: ESTree.ReturnStatement, context: JSXContext) => {
  const val = stmt.argument ? evalExpression(stmt.argument, context) : undefined;
  throw new JSXReturn(val);
};

export const evalSwitchStatement = (stmt: ESTree.SwitchStatement, context: JSXContext) => {
  const label = context.label;
  const discriminant = evalExpression(stmt.discriminant, context);
  let match = false;
  for (const caseStmt of stmt.cases) {
    try {
      match = match || (caseStmt.test ? evalExpression(caseStmt.test, context) === discriminant : true);
      if (match) {
        caseStmt.consequent.forEach((stmt) => evalStatement(stmt, context)), context;
      }
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      }
      throw err;
    }
  }
};

export const evalThrowStatement = (stmt: ESTree.ThrowStatement, context: JSXContext) => {
  throw evalExpression(stmt.argument, context);
};

export const evalTryStatement = (stmt: ESTree.TryStatement, context: JSXContext) => {
  try {
    evalStatement(stmt.block, context);
  } catch (error) {
    if (stmt.handler) {
      context.pushStack(context.resolveThis());
      if (stmt.handler.param) {
        const binding = evalBindingPattern(stmt.handler.param, context);
        setBinding(binding, error, context, 'let');
      }
      evalStatement(stmt.handler.body, context);
      context.popStack();
    } else {
      throw error;
    }
  } finally {
    stmt.finalizer && evalStatement(stmt.finalizer, context);
  }
};

export const evalVariableDeclaration = (stmt: ESTree.VariableDeclaration, context: JSXContext) => {
  const { kind } = stmt;

  return stmt.declarations.map((declaration) => {
    const binding = evalBindingPattern(declaration.id, context);
    setBinding(binding, declaration.init ? evalExpression(declaration.init, context) : undefined, context, kind);
    return binding;
  });
};

export const evalWhileStatement = (stmt: ESTree.WhileStatement, context: JSXContext) => {
  const label = context.label;

  while (evalExpression(stmt.test, context)) {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err instanceof JSXBreak) {
        if (err.isLabeled) {
          if (err.label === label) {
            break;
          } else {
            throw err;
          }
        } else {
          break;
        }
      } else if (err instanceof JSXContinue) {
        if (err.isLabeled) {
          if (err.label === label) {
            continue;
          } else {
            throw err;
          }
        } else {
          continue;
        }
      }
      throw err;
    }
  }
};

export const evalWithStatement = (stmt: ESTree.WithStatement, context: JSXContext) => {
  throw new JSXEvaluateError('with is not supported', stmt, context);
};
