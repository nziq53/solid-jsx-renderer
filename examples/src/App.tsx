import './App.css'
import { JSXRenderer } from '../../src/index'
import { createSignal } from 'solid-js';

// テキスト入力用のコンポーネント
function TextInput(props: { value: string, onChange: (e: any) => any }) {
  return (
    <textarea
      value={props.value}
      onInput={props.onChange}
      style={{
        width: "100%",
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
    <DisplayText text={inputText()} />
    <strong class='strong-text'>
      <div>Let's rewrite!</div>
    </strong>
  </>
  `);

  return (
    <>
      <div>{`
code here: https://github.com/oligami-0424/solid-jsx-renderer

This is a port of the react This is a port of the library of
https://github.com/rosylilly/react-jsx-renderer

I'm not sure about package releases, so I'll get to that later.

by deepl

author oligami
  `}</div>
      <div style={{ width: "95vw" }}>
        <TextInput value={inputText()} onChange={(e) => setInputText(e.target.value)} />
        <JSXRenderer
          binding={{
            console: console,
            inputText: inputText,
          }}
          components={{ DisplayText: DisplayText }}
          code={inputText()}
        />
      </div>
    </>
  )
}

export default App
