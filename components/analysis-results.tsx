import { useEffect, useRef } from "react"

interface AnalysisResultsProps {
  results: {
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
  }
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  // Count all errors
  const totalErrors = results.syntax.errors.length + results.semantic.errors.length;
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const tabs = container.querySelectorAll("[data-tab]");
    const contents = container.querySelectorAll("[data-content]");
    
    // Initialize tabs
    const activateTab = (tabName: string) => {
      // Update active tab styles
      tabs.forEach(tab => {
        if (tab.getAttribute("data-tab") === tabName) {
          tab.classList.add("border-b-2", "border-primary");
          tab.classList.remove("border-transparent");
        } else {
          tab.classList.remove("border-b-2", "border-primary");
          tab.classList.add("border-transparent");
        }
      });
      
      // Show/hide content
      contents.forEach(content => {
        if (content.getAttribute("data-content") === tabName) {
          (content as HTMLElement).style.display = "block";
        } else {
          (content as HTMLElement).style.display = "none";
        }
      });
    };
    
    // Add click handlers
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tabName = tab.getAttribute("data-tab");
        if (tabName) activateTab(tabName);
      });
    });
    
    // Set initial tab
    activateTab("lexical");
    
    // Clean up
    return () => {
      tabs.forEach(tab => {
        tab.removeEventListener("click", () => {});
      });
    };
  }, []);
  
  return (
    <div className="w-full h-full" ref={containerRef}>
      <div className="border-b flex">
        <button className="py-2 px-4 text-sm font-medium border-b-2 border-primary" data-tab="lexical">
          Lexical
        </button>
        <button className="py-2 px-4 text-sm font-medium relative border-transparent" data-tab="syntax">
          Syntax
          {results.syntax.errors.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">
              {results.syntax.errors.length}
            </span>
          )}
        </button>
        <button className="py-2 px-4 text-sm font-medium relative border-transparent" data-tab="semantic">
          Semantic
          {results.semantic.errors.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-yellow-500 rounded-full">
              {results.semantic.errors.length}
            </span>
          )}
        </button>
        <button className="py-2 px-4 text-sm font-medium border-transparent" data-tab="formatted">
          Formatted
        </button>
      </div>

      <div className="py-4 overflow-auto h-[calc(100%-48px)]">
        {/* Lexical Analysis Tab */}
        <div className="h-full" data-content="lexical" style={{ display: 'block' }}>
          <h3 className="text-lg font-medium mb-3">Symbol Table</h3>
          <div className="h-[calc(100vh-300px)] rounded-md border overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Lexeme</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Token Type</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Line</th>
                </tr>
              </thead>
              <tbody>
                {results.lexical.tokens.map((token, index) => (
                  <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 align-middle font-mono">{token.lexeme}</td>
                    <td className="p-2 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {token.type}
                      </span>
                    </td>
                    <td className="p-2 align-middle">{token.line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Syntax Analysis Tab */}
        <div className="h-full" data-content="syntax" style={{ display: 'none' }}>
          <h3 className="text-lg font-medium mb-3">Syntax Analysis</h3>
          {results.syntax.valid ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-green-800 font-medium">Valid Syntax</h4>
                <p className="text-green-700 text-sm">No syntax errors were found in the code.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                <svg className="h-5 w-5 text-red-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-red-800 font-medium">Syntax Errors</h4>
                  <p className="text-red-700 text-sm">Found {results.syntax.errors.length} syntax error(s).</p>
                </div>
              </div>
              <div className="h-[calc(100vh-350px)] rounded-md border overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Error</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-20">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.syntax.errors.map((error, index) => (
                      <tr key={index} className="bg-red-50 border-b">
                        <td className="p-2 align-middle font-medium text-red-700">{error.message}</td>
                        <td className="p-2 align-middle">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                            {error.line}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Semantic Analysis Tab */}
        <div className="h-full" data-content="semantic" style={{ display: 'none' }}>
          <h3 className="text-lg font-medium mb-3">Semantic Analysis</h3>
          {results.semantic.valid ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-green-800 font-medium">Valid Semantics</h4>
                <p className="text-green-700 text-sm">No semantic errors were found in the code.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-yellow-800 font-medium">Semantic Errors</h4>
                  <p className="text-yellow-700 text-sm">Found {results.semantic.errors.length} semantic error(s).</p>
                </div>
              </div>
              <div className="h-[calc(100vh-350px)] rounded-md border overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Error</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-20">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.semantic.errors.map((error, index) => (
                      <tr key={index} className="bg-yellow-50 border-b">
                        <td className="p-2 align-middle font-medium text-yellow-800">{error.message}</td>
                        <td className="p-2 align-middle">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                            {error.line}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Formatted Code Tab */}
        <div className="h-full" data-content="formatted" style={{ display: 'none' }}>
          <h3 className="text-lg font-medium mb-3">Formatted Code</h3>
          <pre className="border rounded-md p-4 bg-gray-50 font-mono text-sm whitespace-pre overflow-auto h-[calc(100vh-330px)]">
            {results.formatted.code}
          </pre>
        </div>
      </div>
    </div>
  )
}
