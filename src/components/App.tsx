import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import { unpkgPathPlugin } from '../plugins/unpkg-path-plugin';
import { fetchPlugin } from '../plugins/fetch-plugin';

const html = `
<html>
  <head></head>
  <body>
    <!-- to render react app -->
    <div id='root'></div>
    <script>
      window.addEventListener('message', (e) => {
        try {
          eval(e.data)
        } catch(err) {
          const root = document.getElementById('root');
          root.innerHTML = '<div style="color: red"><h4>Runtime Error:</h4>' + ' ' + err + '</div>'
        }
      }, false)
    </script>
  </body>
</html>
`;

const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };

  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    iframe.current.srcdoc = html;

    let result;

    try {
      result = await ref.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window',
        },
      });

      iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
    } catch (err) {
      if (err instanceof Error) {
        iframe.current.contentWindow.postMessage(
          `
        (() => {
          const root = document.getElementById('root');
          root.innerHTML = '<div style="color: red"><h4>Runtime Error:</h4>' + ' ' + ${err.message} + '</div>'
        })();
        `,
          '*'
        );
      }
    }
  };

  return (
    <div>
      <textarea
        cols={50}
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
      <iframe ref={iframe} sandbox='allow-scripts' srcDoc={html} title='test' />
    </div>
  );
};

export default App;
