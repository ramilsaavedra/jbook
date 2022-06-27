import * as esbuild from 'esbuild-wasm';
import { Service } from 'esbuild-wasm';
import React, { useState, useEffect, useRef } from 'react';
import { unpkgPathPlugin } from '../plugins/unpkg-path-plugin';
import { fetchPlugin } from '../plugins/fetch-plugin';
import CodeEditor from './CodeEditor';
import { OnChange } from '@monaco-editor/react';

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
  const service = useRef<Service>();
  const iframe = useRef<HTMLIFrameElement>(null);
  const timeout = useRef<NodeJS.Timeout>();
  const [input, setInput] = useState<string | undefined>('');

  const startService = async () => {
    service.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };

  useEffect(() => {
    startService();
  }, []);

  // debounce
  useEffect(() => {
    if (input) {
      timeout.current = setTimeout(() => {
        console.log('bundle');
        if (input) {
          compile(input);
        }
      }, 500);
    }

    return () => {
      clearTimeout(timeout.current as ReturnType<typeof setTimeout>);
    };
  }, [input]);

  const onChange: OnChange = (value) => {
    setInput(value);
  };

  const compile = async (input: string) => {
    if (!service.current || !iframe.current || !iframe.current.contentWindow) {
      return;
    }

    iframe.current.srcdoc = html;

    let result;

    try {
      result = await service.current.build({
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
      <CodeEditor defaultValue='const a = 1' onChange={onChange} />
      <iframe
        title='code preview'
        ref={iframe}
        sandbox='allow-scripts'
        srcDoc={html}
      />
    </div>
  );
};

export default App;
