import React from 'react';

// React ACE
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/ext-language_tools';

export default function CodeEditor({
  id = 'text-code',
  defaultValue = '',
  mode = 'sql',
  theme = 'textmate',
  width = '100%',
  height = '200px',
  onChange,
}) {
  return (
    <AceEditor
      id={id}
      name={id}
      mode={mode}
      theme={theme}
      fontSize={16}
      height={height}
      width={width}
      highlightActiveLine={false}
      defaultValue={defaultValue}
      onChange={onChange}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        printMargin: false,
      }}
      editorProps={{ $blockScrolling: true, autoScrollEditorIntoView: false }}
    />
  );
}
