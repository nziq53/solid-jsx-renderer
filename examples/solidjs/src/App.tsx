import './App.css'
import { JSXRenderer } from '../../../src/index'
import { createSignal } from 'solid-js';

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
<DisplayText text={inputText()} />
</>  
    `)

  return (
    <>
      <JSXRenderer
        binding={{
          console,
          inputText,
          setInputText,
          TextInput,
        }}
        components={{ DisplayText: DisplayText }}
        disableKeyGeneration
        code={inputText()}
      />
    </>
  )
}

export default App
