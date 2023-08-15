import { ESTree } from 'meriyah';
import { evaluate, evaluateJSX, EvaluateOptions, JSXContext, parse, ParseOptions } from '../evaluate';
import { JSXNode, JSXNodeFunc } from '../types';
import { RenderingOptions } from './options';
import { RenderJSX } from './render';
import { Accessor, createContext, createEffect, createMemo, createSignal, For, JSX, mergeProps, on, Ref, Show, splitProps, useContext } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';

export interface JSXNodeRendererProps extends RenderingOptions {
  /**
   * JSX nodes
   */
  nodes: JSXNodeFunc[];
}

const JSXNodeRenderer = (props: JSXNodeRendererProps & { ctx: JSXContext }) => {

  const contextOptions = useContext(JSXRendererContext);
  const [nodes, options] = splitProps(mergeProps(contextOptions, props), ['nodes']);

  return <>
    <For each={nodes.nodes}>{(node, _i) =>
      <RenderJSX node={node} options={options} ctx={props.ctx} />
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

  let contextOptions = useContext(JSXRendererContext);
  // if (!props.disableSolidJSComponents) {
  //   contextOptions = mergeProps(contextOptions, {
  //     binding: {
  //       For
  //     }
  //   })
  // }

  const [thisprop, options] = splitProps(mergeProps(contextOptions, props), ['code', 'fallbackComponent', 'refNodes', 'component', 'componentProps'])
  let Fallback = () => thisprop.fallbackComponent ?? DefaultJSXFallbackComponent;

  props.debug && console.group('JSXRenderer');

  const program: Accessor<{
    program?: ESTree.Program
    error?: Error
  }> = createMemo(() => {
    try {
      const program = parse(thisprop.code || '', { meriyah: props.meriyah, debug: props.debug, forceExpression: !thisprop.component });
      return { program, error: undefined };
    } catch (e) {
      const error = e;
      if (error instanceof Error)
        return { program: undefined, error };
      return { program: undefined, error: undefined }
    }
  }, [thisprop.code, props.meriyah, props.debug, thisprop.component]);

  const ctx = new JSXContext(options)

  createEffect(() => {
    if (typeof thisprop.refNodes === 'function') thisprop.refNodes(nodes.map(node => node.func(options.binding, ctx)));
  });

  const programToNodes = (prog: {
    program?: ESTree.Program;
    error?: Error;
  }): JSXNodeFunc[] | undefined => {
    if (prog.program) {
      if (thisprop.component) {
        const context = evaluate(prog.program, options);
        if (typeof context.exports[thisprop.component] === 'function') {
          return [new JSXNodeFunc((_binding: any, _ctx: JSXContext) => { return { type: 'element', component: context.exports[thisprop.component!], props: thisprop.componentProps || {}, children: [] } }, 'Node')]
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

  createEffect(on([program], ([program]) => {
    let nodes_ret = programToNodes(program)
    if (nodes_ret) setNodes(reconcile(nodes_ret))
  }))

  props.debug && console.groupEnd();

  return (
    <>
      <JSXNodeRenderer {...options} nodes={nodes} ctx={ctx} />
      <Show when={program().error}>
        <Dynamic component={Fallback()} {...props} error={program().error} />
      </Show>
    </>
  )
});

const JSXRendererContext = createContext<JSXRendererProps>({});

export const JSXRendererOptionsProvider = (props: { children: JSX.Element }) => {
  const [local, other] = splitProps(props, ['children'])
  return <JSXRendererContext.Provider value={other}>{local.children}</JSXRendererContext.Provider>;
};
