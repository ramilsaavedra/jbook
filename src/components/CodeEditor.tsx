import React, { useRef, useCallback } from 'react';
import Editor, { OnMount, EditorProps } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

const CodeEditor: React.FC<EditorProps> = ({ onChange, defaultValue }) => {
  const editorref = useRef<monaco.editor.IStandaloneCodeEditor>();

  const onMount: OnMount = (editor, monaco) => {
    editorref.current = editor;
  };

  const onClickFormat = () => {
    if (!editorref.current) {
      return;
    }

    const unformatted = editorref.current.getValue();

    const formatted = prettier.format(unformatted, {
      parser: 'babel',
      plugins: [parser],
      useTabs: false,
      semi: true,
      singleQuote: true,
    });

    editorref.current.setValue(formatted);
  };

  return (
    <div className='editor'>
      <button className='button-format' onClick={onClickFormat}>
        Format
      </button>
      <Editor
        options={{
          fontSize: 16,
          automaticLayout: true,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          showUnused: false,
          wordWrap: 'on',
          minimap: {
            enabled: false,
          },
        }}
        theme='vs-dark'
        height='50vh'
        defaultLanguage='javascript'
        defaultValue={defaultValue}
        onChange={onChange}
        onMount={onMount}
      />
    </div>
  );
};

export default CodeEditor;
