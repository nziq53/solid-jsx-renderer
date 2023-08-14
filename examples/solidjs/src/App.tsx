import './App.css'
import { JSXRenderer } from '../../../src/index'
import { For as ForSolid, Accessor, JSX, createSignal } from 'solid-js';

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

function App() {
  const [inputText, setInputText] = createSignal(`
<>
  <div>
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
  <For each={cats()}>{(cat, i) =>
    <li>
      <a target="_blank" href={\`https://www.youtube.com/watch?v=\${cat.id}\`}>
        {i() + 1}: {cat.name}
      </a>
    </li>
  }</For>
  <DisplayText text={inputText()} />
</>  
    `)

  // const [cats, setCats] = createSignal([
  //   { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
  //   { id: 'z_AbfPXTKms', name: 'Maru' },
  //   { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  // ]);

  const cats = () => {
    // console.log("###")
    return [
      { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
      { id: 'z_AbfPXTKms', name: 'Maru' },
      { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
    ]
  }

  return (
    <>
      <For each={cats()}>{(cat, i) =>
        <li>
          <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
            {i() + 1}: {cat.name}
          </a>
        </li>
      }</For>
      <JSXRenderer
        binding={{
          console,
          inputText,
          setInputText,
          TextInput,
          cats,
          For,
        }}
        components={{ DisplayText: DisplayText }}
        disableKeyGeneration
        code={inputText()}
      />
    </>
  )
}

export default App

function For<T extends readonly any[], U extends JSX.Element>(props: {
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  children: (item: T[number], index: Accessor<number>) => U;
}): JSX.Element {
  // if (props.each)
  //   for (let item of props.each) {
  //     console.log(item)
  //   }
  // console.log(props.children)
  return <ForSolid {...props} >{props.children}</ForSolid>
}