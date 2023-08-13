import { ESTree } from 'meriyah';
import { evaluate, evaluateJSX, EvaluateOptions, parse, ParseOptions } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { renderJSX } from './render';
import { Accessor, createContext, createEffect, createMemo, JSX, mergeProps, on, Ref, Show, splitProps, useContext } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export interface JSXNodeRendererProps extends RenderingOptions {
  /**
   * JSX nodes
   */
  nodes: JSXNode[];
}

const JSXNodeRenderer = (props: JSXNodeRendererProps) => {
  const contextOptions = useContext(JSXRendererContext);
  const [nodes, options] = splitProps(mergeProps(contextOptions, props), ['nodes']);

  return <>{nodes.nodes.map((node: JSXNode | JSXNode[]) => renderJSX(node, options))}</>;
};

export { JSXNodeRenderer };
export { JSXRenderer };

export interface JSXRendererProps extends ParseOptions, EvaluateOptions, Omit<JSXNodeRendererProps, 'nodes'> {
  /**
   * JSX code
   */
  code?: string;

  /**
   * The component that will be displayed instead when an error occurs.
   */
  fallbackComponent?: JSXFallbackComponent;

  /**
   * If you want to receive the parsed result, set a Ref object to this option.
   */
  refNodes?: Ref<JSXNode[]>;

  /**
   * Rendering Component name(optional)
   */
  component?: string;

  /**
   * Rendering component props(optional)
   */
  componentProps?: Record<string, any>;
}

export type JSXFallbackComponent = (props: { error?: any; debug?: any; } & JSXRendererProps) => JSX.Element

const DefaultJSXFallbackComponent: JSXFallbackComponent = (props: { error?: any; debug?: any; }) => {
  const { error, debug } = props;
  debug && console.error(error);

  return <>{error.message}</>;
};

const JSXRenderer = ((props: JSXRendererProps) => {
  const contextOptions = useContext(JSXRendererContext);
  const [code, fallbackComponent, refNodes, component, componentProps, options] = splitProps(mergeProps(contextOptions, props), ['code'], ['fallbackComponent'], ['refNodes'], ['component'], ['componentProps'])
  const Fallback = fallbackComponent.fallbackComponent ? fallbackComponent.fallbackComponent : DefaultJSXFallbackComponent;


  props.debug && console.group('JSXRenderer');

  const program: Accessor<{
    program?: ESTree.Program
    error?: Error
  }> = createMemo(() => {
    try {
      const program = parse(code.code || '', { meriyah: props.meriyah, debug: props.debug, forceExpression: !component.component });
      return { program, error: undefined };
    } catch (e) {
      const error = e as Error;
      return { program: undefined, error };
    }
  });

  createEffect(() => {
    if (typeof refNodes.refNodes === 'function') refNodes.refNodes(nodes);
  });

  const [nodes, setNodes] = createStore([] as JSXNode[])

  createEffect(on(program, (program) => {
    if (program.program) {
      if (component.component) {
        const context = evaluate(program.program, options);
        if (typeof context.exports[component.component] === 'function') {
          setNodes(reconcile([{ type: 'element', component: context.exports[component.component], props: componentProps.componentProps || {}, children: [] }]))
        } else {
          setNodes(reconcile([]))
        }
      } else {
        setNodes(reconcile(evaluateJSX(program.program, options)))
      }
    }
  }))


  props.debug && console.groupEnd();

  return (
    <>
      <JSXNodeRenderer {...options} nodes={nodes} />
      <Show when={program().error}>
        <Fallback {...props} error={program().error} />
      </Show>
    </>
  )
});

const JSXRendererContext = createContext<JSXRendererProps>({});

export const JSXRendererOptionsProvider = (props: { children: JSX.Element }) => {
  const [local, other] = splitProps(props, ['children'])
  return <JSXRendererContext.Provider value={other}>{local.children}</JSXRendererContext.Provider>;
};
