"use client"

import { useState, useEffect } from "react"
import { LanguageSelector } from "@/components/language-selector"
import { CodeEditor } from "@/components/code-editor"
import { AnalysisResults } from "@/components/analysis-results"
import { analyzeCode } from "@/lib/code-analyzer"
import { Button } from "@/components/ui/button"
import { UploadButton } from "@/components/upload-button"
import { Toaster } from "@/components/ui/toaster"

// Define the type for analysis results
type AnalysisResultType = {
  lexical: {
    tokens: Array<{
      lexeme: string
      type: string
      line: number
    }>
  }
  syntax: {
    valid: boolean
    errors: Array<{
      message: string
      line: number
    }>
  }
  semantic: {
    valid: boolean
    errors: Array<{
      message: string
      line: number
    }>
  }
  formatted: {
    code: string
  }
} | null

export default function Home() {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [results, setResults] = useState<AnalysisResultType>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // This useEffect ensures we only render client-specific content after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAnalyze = async () => {
    if (!code.trim()) return

    setIsAnalyzing(true)
    try {
      const analysisResults = await analyzeCode(code, language)
      setResults(analysisResults)
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (content: string) => {
    setCode(content)
  }

  // Calculate error counts
  const syntaxErrors = results?.syntax.errors.length || 0;
  const semanticErrors = results?.semantic.errors.length || 0;
  const totalErrors = syntaxErrors + semanticErrors;

  // Only render client-dependent parts of the UI after hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Loading analyzer...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Code Analyzer</h1>
          </div>
          <p className="text-muted-foreground text-center max-w-xl">
            A powerful syntax and semantic analyzer for multiple programming languages.
            Write or upload code to identify syntax and semantic errors.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 items-center justify-center">
          <div className="border border-primary/20 p-3 rounded-md flex gap-3 items-center">
            <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
            <UploadButton onFileUpload={handleFileUpload} selectedLanguage={language} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side: Code Editor */}
          <div className="border shadow-sm rounded-md">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Source Code</h2>
                </div>
                <div className="text-xs px-2.5 py-0.5 bg-gray-100 rounded-full font-medium">
                  {language.toUpperCase()}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Write or paste your code here for analysis
              </p>
            </div>
            <div className="h-[calc(70vh-10rem)]">
              <CodeEditor code={code} onChange={setCode} language={language} />
            </div>
            <div className="border-t p-3 flex justify-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !code.trim()} 
                className="group"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </span>
                ) : (
                  <span>Analyze Code</span>
                )}
              </Button>
            </div>
          </div>

          {/* Right side: Analysis Results */}
          <div className="border shadow-sm rounded-md h-[70vh]">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Analysis Results</h2>
                </div>
                {results && (
                  totalErrors > 0 ? (
                    <div className="text-xs px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">
                      {totalErrors} Error{totalErrors !== 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div className="text-xs px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                      Success
                    </div>
                  )
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {results 
                  ? `Showing analysis of your ${language} code`
                  : "Results will appear here after analysis"
                }
              </p>
            </div>
            <div className="h-[calc(100%-9rem)]">
              {results ? (
                <AnalysisResults results={results} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {code.trim() 
                    ? "Click 'Analyze Code' to see results" 
                    : "Enter or upload code to analyze"
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
