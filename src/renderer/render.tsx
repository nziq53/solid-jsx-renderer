import { ESTree } from 'meriyah';
import { JSXElement, JSXFragment, JSXNode, JSXText } from '../types';
import { isUnknownHTMLElementTagName } from './isUnknownElementTagName';
import { RenderingOptions } from './options';
import { For, mergeProps } from 'solid-js';
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

const RenderJSXNode = (props: { node: JSXElement | JSXFragment, options: RenderingOptions }) => {
  switch (props.node.type) {
    case 'element':
      return <RenderJSXElement element={props.node} options={props.options} />;
    case 'fragment':
      return <RenderJSXFragment fragment={props.node} options={props.options} />
  }
};

const RenderJSXElement = (props: { element: JSXElement, options: RenderingOptions }) => {
  const filtered = applyFilter(props.options.elementFilters || [], props.element);
  if (!filtered) return undefined;

  if (props.options.disableUnknownHTMLElement && typeof filtered.component === 'string') {
    const { component } = filtered;
    const checker = props.options.isUnknownHTMLElementTagName || isUnknownHTMLElementTagName;
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

  let move_props = mergeProps(filtered.props, renderSourcePosition(props.element.loc, props.options))
  return (
    <Dynamic component={filtered.component} {...move_props}>
      <For each={filtered.children}>{(child, _i) =>
        <RenderJSX node={child} options={props.options} />
      }</For>
    </Dynamic>
  );
};

const RenderJSXFragment = (props: { fragment: JSXFragment, options: RenderingOptions }) => {
  const filtered = applyFilter(props.options.fragmentFilters || [], props.fragment);

  if (filtered) {
    return (
      <For each={filtered.children}>{(child, _i) =>
        <RenderJSX node={child} options={props.options} />
      }</For>
    )
  } else {
    return <></>;
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
