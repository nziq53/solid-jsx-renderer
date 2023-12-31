import './test.css'
import { JSXRenderer } from '../../../../src/index'
import { createSignal } from 'solid-js';

// テキスト入力用のコンポーネント
function TextInput(props: { value: string, onChange: (e: any) => any }) {
  let ref: HTMLTextAreaElement
  ref! && ref.focus()
  // console.log("testttt")
  // console.log(props)
  // console.log(props.value)
  // console.log(props.onChange)

  return (
    <textarea
      ref={ref!}
      onInput={props.onChange}
      style={{
        width: "95%",
        height: "200px",
        resize: "vertical",
      }}
    >{props.value}</textarea>
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
  const [inputText, setInputText] = createSignal(initialStr)

  // setTimeout(() => {
  //   setInputText(initialStr)
  // }, 1000)

  return (
    <>
      <p>test</p>
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

const initialStr = `
<>
<div>
  <p>code here: https://github.com/oligami-0424/solid-jsx-renderer</p>
  <p>This is a port of the react This is a port of the library of
    <a href="https://github.com/rosylilly/react-jsx-renderer" target="_blank" rel="noopener noreferrer">https://github.com/rosylilly/react-jsx-renderer</a></p>
  <p></p>
  <p>I'm not sure about package releases, so I'll get to that later.</p>
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
`