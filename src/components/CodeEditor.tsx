import React from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  onChange: OnChange;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange }) => {
  return (
    <Editor
      options={{
        wordWrap: 'on',
        minimap: {
          enabled: false,
        },
      }}
      theme='vs-dark'
      height='50vh'
      defaultLanguage='javascript'
      defaultValue='// some comment'
      onChange={onChange}
    />
  );
};
export default CodeEditor;
