import React from 'react';
import Editor from '@monaco-editor/react';
import { OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  onChange: OnChange;
  defaultValue: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, defaultValue }) => {
  return (
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
    />
  );
};
export default CodeEditor;
