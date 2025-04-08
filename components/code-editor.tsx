"use client"

import { useEffect, useState } from "react"
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { python } from '@codemirror/lang-python'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { dracula } from '@uiw/codemirror-theme-dracula'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  language: string
}

export function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return javascript({ jsx: true, typescript: language === 'typescript' })
      case 'java':
        return java()
      case 'c':
      case 'cpp':
        return cpp()
      case 'python':
        return python()
      default:
        return javascript()
    }
  }

  return (
    <div className="h-full w-full rounded-md overflow-hidden border border-border">
      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[getLanguageExtension()]}
        onChange={onChange}
        className="text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          autocompletion: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
        }}
      />
    </div>
  )
}
