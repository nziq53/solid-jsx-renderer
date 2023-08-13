import { ESTree } from 'meriyah';
import { evaluate, evaluateJSX, EvaluateOptions, parse, ParseOptions } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { RenderJSX } from './render';
import { Accessor, createContext, createEffect, createMemo, For, JSX, mergeProps, on, Ref, Show, splitProps, useContext } from 'solid-js';
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

  return <>
    <For each={nodes.nodes}>{(node, _i) =>
      <RenderJSX node={node} options={options} />
    }</For>
  </>;
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


  const programToNodes = (prog: {
    program?: ESTree.Program;
    error?: Error;
  }): JSXNode[] | undefined => {
    if (prog.program) {
      if (component.component) {
        const context = evaluate(prog.program, options);
        if (typeof context.exports[component.component] === 'function') {
          return [{ type: 'element', component: context.exports[component.component], props: componentProps.componentProps || {}, children: [] }]
        } else {
          return []
        }
      } else {
        return evaluateJSX(prog.program, options)
      }
    }
    return undefined
  }

  const [nodes, setNodes] = createStore(programToNodes(program()) ?? [])

  createEffect(on(program, (program) => {
    let nodes_ret = programToNodes(program)
    if (nodes_ret) setNodes(reconcile(nodes_ret))
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
