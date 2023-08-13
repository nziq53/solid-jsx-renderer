import { ESTree } from 'meriyah';
import { JSXElement, JSXFragment, JSXNode, JSXText } from '../types';
import { isUnknownHTMLElementTagName } from './isUnknownElementTagName';
import { RenderingOptions } from './options';
import { JSX } from 'solid-js';
import { Dynamic } from "solid-js/web";

const fileName = 'jsx';

export const renderJSX = (node: JSXNode | JSXNode[], options: RenderingOptions): JSX.Element | JSX.Element[] => {
  if (node === null) return node;
  if (node === undefined) return node;
  if (Array.isArray(node)) return node.map((n) => renderJSX(n, options));

  switch (typeof node) {
    case 'boolean':
      return node;
    case 'string':
    case 'number':
      return renderJSXText(node, options);
    default:
      return renderJSXNode(node, options);
  }
};

const renderJSXText = (text: JSXText, options: RenderingOptions): JSX.Element => {
  return applyFilter(options.textFilters || [], text);
};

const renderJSXNode = (node: JSXElement | JSXFragment, options: RenderingOptions): JSX.Element => {
  switch (node.type) {
    case 'element':
      return renderJSXElement(node, options);
    case 'fragment':
      return renderJSXFragment(node, options);
  }
};

const renderJSXElement = (element: JSXElement, options: RenderingOptions): JSX.Element => {
  const filtered = applyFilter(options.elementFilters || [], element);
  if (!filtered) return undefined;

  if (options.disableUnknownHTMLElement && typeof filtered.component === 'string') {
    const { component } = filtered;
    const checker = options.isUnknownHTMLElementTagName || isUnknownHTMLElementTagName;
    if (checker(component)) return undefined;
  }

  // const component = filtered.component as AnyFunction;
  // if (typeof component === 'function') {
  //   const props = { ...filtered.props };
  //   let children = component(props);
  //   if (!Array.isArray(children)) children = [children];
  //   console.log(children)
  //   return (
  //     <>
  //       {
  //         children.map((child: JSXNode | JSXNode[]) => renderJSX(child, options))
  //       }
  //     </>
  //   )
  // }

  let move_props = {
    ...filtered.props,
    ...renderSourcePosition(element.loc, options),
  }
  return (
    <Dynamic component={filtered.component} {...move_props}>
      {
        filtered.children.map((child) => renderJSX(child, options))
      }
    </Dynamic>
  );
};

const renderJSXFragment = (fragment: JSXFragment, options: RenderingOptions): JSX.Element => {
  const filtered = applyFilter(options.fragmentFilters || [], fragment);

  if (filtered) {
    return (
      <>
        {
          filtered?.children.map((child) => renderJSX(child, options))
        }
      </>
    )
  } else {
    return undefined;
  }
};

const applyFilter = <T extends JSXNode>(filters: ((target: T) => T | undefined)[], node: T): T | undefined => {
  return filters.reduce<T | undefined>((prev, filter) => (prev ? filter(prev) : undefined), node);
};

type SourcePosition = {
  __source: {
    fileName: string;
    lineNumber?: number;
    columnNumber?: number;
  };
};

const renderSourcePosition = (loc: ESTree.Position | undefined, _options: RenderingOptions): SourcePosition | Record<string, never> => {
  return loc ? { __source: { fileName, lineNumber: loc.line, columnNumber: loc.column } } : { __source: { fileName } };
};
