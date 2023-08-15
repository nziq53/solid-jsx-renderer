import './App.css'
import { JSXRenderer } from '../../../src/index'
import { Accessor, For, JSX, Show, createSignal } from 'solid-js';

// テキスト入力用のコンポーネント
function TextInput(props: { value: string, onChange: (e: any) => any }) {
  let ref: HTMLTextAreaElement
  ref! && ref.focus()

  return (
    <textarea
      ref={ref!}
      value={props.value}
      onInput={props.onChange}
      style={{
        width: "95%",
        height: "200px",
        resize: "vertical",
      }}
    />
  );
}

// リアルタイム表示用のコンポーネント
function DisplayText(props: { text: string }) {
  return (
    <div>
      <p>input text: {props.text}</p>
    </div>
  );
}

// リアルタイム表示用のコンポーネント
function DisplayCats(props: { cats: { id: string, name: string }[] }) {
  return (
    <For each={props.cats}>{(cat, i) => {
      // console.log("###")
      return <li>
        <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
          {i() + 1}: {cat.name}
        </a>
      </li>
    }}</For>
  );
}

function App(props: { time: boolean }) {
  const [inputText, setInputText] = createSignal(`
<>
  <div>
    <div>{test_func()}</div>
    <Show when={true}>
    </Show>
    <p>code here: <a href="https://github.com/oligami-0424/solid-jsx-renderer" target="_blank" rel="noopener noreferrer">https://github.com/oligami-0424/solid-jsx-renderer</a></p>
    <p>This is a port of the react This is a port of the library of
      <a href="https://github.com/rosylilly/react-jsx-renderer" target="_blank" rel="noopener noreferrer">https://github.com/rosylilly/react-jsx-renderer</a></p>
    <p></p>
    <p> npm package is 「 <a href="https://www.npmjs.com/package/@oligami/solid-jsx-renderer" target="_blank" rel="noopener noreferrer">@oligami/solid-jsx-renderer</a> 」 </p>
    <br />
    <p>by deepl</p>
    <p>author oligami</p>
  </div>
  <br/>
  <strong class='strong-text'>
    <div>Let's rewrite!</div>
  </strong>
  <TextInput value={inputText()} onChange={(e) => setInputText(e.target.value)} />
  <For each={cats()}>{(cat, i) => {
    // console.log("###")
    return <li>
      <a target="_blank" href={\`https://www.youtube.com/watch?v=\${cat.id}\`}>
        {i() + 1}: {cat.name}
      </a>
    </li>
  }}</For>
  <Index each={cats()}>{(cat, i) => {
  // console.log("###")
    return <li>
      <a target="_blank" href={\`https://www.youtube.com/watch?v=\${cat.id}\`}>
        {i + 1}: {cat().name}
      </a>
    </li>
  }}</Index >
  <A href="/">link index</A>
  <DisplayCats cats={cats()} />
  <DisplayText text={inputText()} />
</>
    `)

  const [cats, setCats] = createSignal([
    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
    { id: 'z_AbfPXTKms', name: 'Maru' },
    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  ]);

  const [onetime, setOnetime] = createSignal(false)
  setTimeout(() => {
    setOnetime(true)
  }, 5000)

  setTimeout(() => {
    setCats([])
  }, 3000)

  // setTimeout(() => {
  //   setInputText("<></>")
  // }, 10000)

  const [disableSolidJSComponents, setdisableSolidJSComponents] = createSignal(false)

  setTimeout(() => {
    setdisableSolidJSComponents(true)
  }, 3000)

  return (
    <>
      {/* <DisplayCats cats={cats()} /> */}
      <JSXRenderer
        binding={{
          console,
          inputText,
          setInputText,
          cats,
          setCats,
          onetime,
          test_func,
          time: props.time,
          // Show
        }}
        components={{ DisplayText, DisplayCats, TextInput }}
        disableKeyGeneration
        code={`${inputText()}`}
        disableSolidJSComponents={disableSolidJSComponents()}
        debug
      />
    </>
  )
}

export default function WrapApp() {
  const [onetime, setOnetime] = createSignal(false)
  setTimeout(() => {
    setOnetime(true)
  }, 10000)

  return <App time={onetime()} />
}

// function Show<T, TRenderFunction extends (item: Accessor<NonNullable<T>>) => JSX.Element>(props: {
//   when: T | undefined | null | false;
//   keyed?: false;
//   fallback?: JSX.Element;
//   children: JSX.Element;
// }) {
//   console.log("#######")
//   return <ShowAs when={props.when}>
//     {props.children}
//   </ShowAs>
// }

const test_func = () => {
  // console.log("test_func")
  return "test_func"
}