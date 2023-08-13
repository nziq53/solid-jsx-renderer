import './App.css'
import { JSXRenderer } from '../../src/index'
import { Show, createSignal } from 'solid-js';

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
  <p>code here: https://github.com/oligami-0424/solid-jsx-renderer</p>
  <p>This is a port of the react This is a port of the library of
    https://github.com/rosylilly/react-jsx-renderer</p>
  <p></p>
  <p>I'm not sure about package releases, so I'll get to that later.</p>
  <button onClick={setInternal}>However, I am not sure about keygenerate in createStore, so I am leaving it alone. Therefore, when I put TextInput inside, it is very hard to get the focus off every time I type!</button>
  <br />
  <p>by deepl</p>
  <p>author oligami</p>
</div>
<br/>
<strong class='strong-text'>
<div>Let's rewrite!</div>
</strong>
<DisplayText text={inputText()} />
</>
    `);
  const [showSignal, setShowSignal] = createSignal(true)
  const setInternal = () => {
    setShowSignal(false)
    setInputText(`
<>
<div>
  <p>code here: https://github.com/oligami-0424/solid-jsx-renderer</p>
  <p>This is a port of the react This is a port of the library of
    https://github.com/rosylilly/react-jsx-renderer</p>
  <p></p>
  <p>I'm not sure about package releases, so I'll get to that later.</p>
  <button onClick={setInternal}>However, I am not sure about keygenerate in createStore, so I am leaving it alone. Therefore, when I put TextInput inside, it is very hard to get the focus off every time I type!</button>
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
  }

  return (
    <>
      <Show when={showSignal()}>
        <TextInput value={inputText()} onChange={(e) => setInputText(e.target.value)} />
      </Show>
      <JSXRenderer
        binding={{
          console,
          inputText,
          setInputText,
          TextInput,
          setInternal
        }}
        components={{ DisplayText: DisplayText }}
        code={inputText()}
      />
    </>
  )
}

export default App
