import { ESTree } from 'meriyah';
import { JSXElement, JSXFragment, JSXNode, JSXText } from '../types';
import { isUnknownHTMLElementTagName } from './isUnknownElementTagName';
import { RenderingOptions } from './options';
import { For, JSX, mergeProps } from 'solid-js';
import { Dynamic } from "solid-js/web";

const fileName = 'jsx';

export const RenderJSX = (props: { node: JSXNode | JSXNode[], options: RenderingOptions }) => {
  if (props.node === null) return undefined;
  if (props.node === undefined) return undefined;
  if (Array.isArray(props.node)) {
    return <For each={props.node}>{(node, _i) =>
      <RenderJSX node={node} options={props.options} />
    }</For>
  }

  switch (typeof props.node) {
    case 'boolean':
      return <>props.node</>;
    case 'string':
    case 'number':
      return <RenderJSXText text={props.node} options={props.options} />
    default:
      return <RenderJSXNode node={props.node} options={props.options} />
  }
};

const RenderJSXText = (props: { text: JSXText, options: RenderingOptions }) => {
  return applyFilter(props.options.textFilters || [], props.text);
};

const RenderJSXNode = (props: { node: JSXElement | JSXFragment, options: RenderingOptions }): JSX.Element => {
  switch (props.node.type) {
    case 'element':
      return renderJSXElement(props.node, props.options);
    case 'fragment':
      return renderJSXFragment(props.node, props.options);
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

  let move_props = mergeProps(filtered.props, renderSourcePosition(element.loc, options))
  return (
    <Dynamic component={filtered.component} {...move_props}>
      <For each={filtered.children}>{(child, _i) =>
        <RenderJSX node={child} options={options} />
      }</For>
    </Dynamic>
  );
};

const renderJSXFragment = (fragment: JSXFragment, options: RenderingOptions): JSX.Element => {
  const filtered = applyFilter(options.fragmentFilters || [], fragment);

  if (filtered) {
    return (
      <For each={filtered.children}>{(child, _i) =>
        <RenderJSX node={child} options={options} />
      }</For>
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
