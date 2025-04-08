// Simple lexical analyzer for different languages
const tokenPatterns = {
  javascript: [
    {
      type: "keyword",
      pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
    { type: "string", pattern: /(["'])(.*?)\1/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~?:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "comment", pattern: /\/\/.*|\/\*[\s\S]*?\*\// },
    { type: "whitespace", pattern: /\s+/ },
  ],
  typescript: [
    {
      type: "keyword",
      pattern:
        /\b(const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|async|await)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
    { type: "string", pattern: /(["'])(.*?)\1/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~?:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "comment", pattern: /\/\/.*|\/\*[\s\S]*?\*\// },
    { type: "whitespace", pattern: /\s+/ },
  ],
  python: [
    {
      type: "keyword",
      pattern:
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|in|is|not|and|or|True|False|None)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
    { type: "string", pattern: /(["'])(.*?)\1|"""[\s\S]*?"""|'''[\s\S]*?'''/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~@:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "comment", pattern: /#.*/ },
    { type: "whitespace", pattern: /\s+/ },
  ],
  java: [
    {
      type: "keyword",
      pattern:
        /\b(public|private|protected|class|interface|enum|extends|implements|static|final|void|if|else|for|while|return|new|this|super)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
    { type: "string", pattern: /".*?"/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~?:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "comment", pattern: /\/\/.*|\/\*[\s\S]*?\*\// },
    { type: "whitespace", pattern: /\s+/ },
  ],
  c: [
    {
      type: "keyword",
      pattern:
        /\b(int|char|float|double|void|struct|union|enum|if|else|for|while|return|switch|case|break|continue|typedef)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
    { type: "string", pattern: /".*?"/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~?:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "preprocessor", pattern: /#[a-zA-Z]+/ },
    { type: "comment", pattern: /\/\/.*|\/\*[\s\S]*?\*\// },
    { type: "whitespace", pattern: /\s+/ },
  ],
  cpp: [
    {
      type: "keyword",
      pattern:
        /\b(int|char|float|double|void|struct|class|namespace|template|public|private|protected|if|else|for|while|return|new|delete|using|try|catch)\b/,
    },
    { type: "identifier", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
    { type: "string", pattern: /".*?"/ },
    { type: "number", pattern: /\b\d+(\.\d+)?\b/ },
    { type: "operator", pattern: /[+\-*/%=<>!&|^~?:]+/ },
    { type: "punctuation", pattern: /[{}[\]();,.]/ },
    { type: "preprocessor", pattern: /#[a-zA-Z]+/ },
    { type: "comment", pattern: /\/\/.*|\/\*[\s\S]*?\*\// },
    { type: "whitespace", pattern: /\s+/ },
  ],
}

// Perform lexical analysis
function performLexicalAnalysis(code: string, language: string) {
  const patterns = tokenPatterns[language as keyof typeof tokenPatterns] || tokenPatterns.javascript
  const tokens: Array<{ lexeme: string; type: string; line: number }> = []
  const lines = code.split("\n")

  lines.forEach((line, lineIndex) => {
    let position = 0

    while (position < line.length) {
      let match = null
      let matchedType = ""

      for (const { type, pattern } of patterns) {
        pattern.lastIndex = 0 // Reset regex state
        const regex = new RegExp(`^${pattern.source}`, "g")
        const result = regex.exec(line.substring(position))

        if (result && result[0]) {
          if (!match || result[0].length > match.length) {
            match = result[0]
            matchedType = type
          }
        }
      }

      if (match) {
        if (matchedType !== "whitespace" && matchedType !== "comment") {
          tokens.push({
            lexeme: match,
            type: matchedType,
            line: lineIndex + 1,
          })
        }
        position += match.length
      } else {
        // Skip unrecognized character
        position++
      }
    }
  })

  return tokens
}

// Perform basic syntax analysis
function performSyntaxAnalysis(tokens: Array<{ lexeme: string; type: string; line: number }>, language: string) {
  const errors: Array<{ message: string; line: number }> = []
    const stack: Array<{ char: string; line: number }> = []

  // Reserved keywords that cannot be used as variable names
  const reservedKeywords = new Set([
    // JavaScript/TypeScript keywords
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
    "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if",
    "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw",
    "true", "try", "typeof", "var", "void", "while", "with", "yield",
    // TypeScript specific
    "interface", "type", "namespace", "module", "declare", "abstract", "implements",
    // Java keywords
    "abstract", "assert", "boolean", "byte", "char", "class", "double", "enum", "extends",
    "final", "float", "implements", "import", "instanceof", "int", "interface", "long",
    "native", "package", "private", "protected", "public", "short", "static", "strictfp",
    "super", "synchronized", "throws", "transient", "volatile"
  ])

  // Keywords that should be followed by a semicolon
  const statementEndKeywords = new Set([
    "break", "continue", "return", "throw"
  ])

  // Check for matching brackets and parentheses
    for (const token of tokens) {
      if (token.type === "punctuation") {
        if (token.lexeme === "{" || token.lexeme === "[" || token.lexeme === "(") {
          stack.push({ char: token.lexeme, line: token.line })
        } else if (token.lexeme === "}") {
          if (stack.length === 0 || stack[stack.length - 1].char !== "{") {
            errors.push({ message: "Unmatched closing brace", line: token.line })
          } else {
            stack.pop()
          }
        } else if (token.lexeme === "]") {
          if (stack.length === 0 || stack[stack.length - 1].char !== "[") {
            errors.push({ message: "Unmatched closing bracket", line: token.line })
          } else {
            stack.pop()
          }
        } else if (token.lexeme === ")") {
          if (stack.length === 0 || stack[stack.length - 1].char !== "(") {
            errors.push({ message: "Unmatched closing parenthesis", line: token.line })
          } else {
            stack.pop()
          }
        }
      }
    }

    // Check for unclosed brackets or parentheses
    for (const item of stack) {
      let message = "Unclosed "
      if (item.char === "{") message += "brace"
      else if (item.char === "[") message += "bracket"
      else if (item.char === "(") message += "parenthesis"
    errors.push({ message, line: item.line })
  }

  // Language-specific syntax checks
  if (language === "javascript" || language === "typescript" || language === "java") {
    // Check for invalid variable names and reserved keywords
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      
      // Check for reserved keywords used as variable names
      if (token.type === "identifier" && reservedKeywords.has(token.lexeme)) {
        // Allow if it's part of a property access (e.g., obj.int)
        if (i > 0 && tokens[i - 1].lexeme === ".") {
          continue
        }
        errors.push({ 
          message: `'${token.lexeme}' is a reserved keyword and cannot be used as a variable name`, 
          line: token.line 
        })
      }

      // Check for invalid variable declarations
      if ((tokens[i].lexeme === "const" || tokens[i].lexeme === "let" || tokens[i].lexeme === "var") &&
          i + 1 < tokens.length) {
        const nextToken = tokens[i + 1]
        if (reservedKeywords.has(nextToken.lexeme)) {
          errors.push({ 
            message: `Cannot declare variable with reserved keyword '${nextToken.lexeme}'`, 
            line: nextToken.line 
          })
        }
      }
    }

    // Check for invalid function declarations
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "function" && tokens[i + 1].type !== "identifier") {
        errors.push({ message: "Invalid function declaration", line: tokens[i].line })
      }
    }

    // Check for invalid variable declarations
    for (let i = 0; i < tokens.length - 2; i++) {
      if ((tokens[i].lexeme === "const" || tokens[i].lexeme === "let" || tokens[i].lexeme === "var") &&
          tokens[i + 1].type !== "identifier") {
        errors.push({ message: "Invalid variable declaration", line: tokens[i].line })
      }
    }

    // Check for invalid operators
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].type === "operator" && tokens[i + 1].type === "operator") {
        // Allow some valid operator combinations
        const validCombinations = ["++", "--", "==", "!=", "<=", ">=", "&&", "||", "+=", "-=", "*=", "/=", "%="]
        const combined = tokens[i].lexeme + tokens[i + 1].lexeme
        if (!validCombinations.includes(combined)) {
          errors.push({ message: "Invalid operator combination", line: tokens[i].line })
        }
      }
    }

    // Check for invalid semicolon usage
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === ";" && tokens[i + 1].lexeme === ";") {
        errors.push({ message: "Multiple semicolons", line: tokens[i].line })
      }
    }

    // Check for invalid control structures
    const controlKeywords = ["if", "else", "for", "while", "do", "switch", "case", "default", "try", "catch", "finally"]
    for (let i = 0; i < tokens.length - 1; i++) {
      if (controlKeywords.includes(tokens[i].lexeme)) {
        // Check for missing parentheses after control keywords
        if (tokens[i + 1].lexeme !== "(" && tokens[i].lexeme !== "else" && tokens[i].lexeme !== "default") {
          errors.push({ message: `Missing parentheses after '${tokens[i].lexeme}'`, line: tokens[i].line })
        }
      }
    }

    // Check for invalid object literals
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "{" && tokens[i + 1].lexeme === "}") {
        // Empty object is valid, but check for invalid property syntax
        if (i + 2 < tokens.length && tokens[i + 2].type === "identifier" && tokens[i + 3].lexeme !== ":") {
          errors.push({ message: "Invalid object property syntax", line: tokens[i].line })
        }
      }
    }

    // Check for invalid array literals
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "[" && tokens[i + 1].lexeme === "]") {
        // Empty array is valid, but check for invalid element syntax
        if (i + 2 < tokens.length && tokens[i + 2].lexeme === ",") {
          errors.push({ message: "Invalid array element syntax", line: tokens[i].line })
        }
      }
    }

    // Check for invalid string literals
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "string") {
        const str = tokens[i].lexeme
        if (!str.startsWith('"') && !str.startsWith("'")) {
          errors.push({ message: "Invalid string literal", line: tokens[i].line })
        }
      }
    }

    // Check for invalid number literals
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "number") {
        const num = tokens[i].lexeme
        if (isNaN(Number(num))) {
          errors.push({ message: "Invalid number literal", line: tokens[i].line })
        }
      }
    }

    // Check for missing semicolons
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i]
      const nextToken = tokens[i + 1]

      // Check for missing semicolon after variable declaration
      if ((token.lexeme === "const" || token.lexeme === "let" || token.lexeme === "var") &&
          i + 2 < tokens.length && tokens[i + 2].lexeme !== "=") {
        let j = i + 2
        while (j < tokens.length && tokens[j].lexeme !== ";" && tokens[j].lexeme !== "{" && 
               tokens[j].lexeme !== "}" && tokens[j].lexeme !== "\n") {
          j++
        }
        if (j < tokens.length && tokens[j].lexeme !== ";") {
          errors.push({ message: "Missing semicolon after variable declaration", line: token.line })
        }
      }

      // Check for missing semicolon after expression
      if (token.type === "identifier" || token.type === "number" || token.type === "string") {
        if (nextToken.lexeme !== ";" && nextToken.lexeme !== "." && nextToken.lexeme !== "(" &&
            nextToken.lexeme !== "[" && nextToken.lexeme !== "++" && nextToken.lexeme !== "--" &&
            nextToken.lexeme !== "=" && nextToken.lexeme !== "+=" && nextToken.lexeme !== "-=" &&
            nextToken.lexeme !== "*=" && nextToken.lexeme !== "/=" && nextToken.lexeme !== "%=" &&
            nextToken.lexeme !== "&&" && nextToken.lexeme !== "||" && nextToken.lexeme !== "?" &&
            nextToken.lexeme !== ":" && nextToken.lexeme !== "," && nextToken.lexeme !== ")" &&
            nextToken.lexeme !== "}" && nextToken.lexeme !== "\n") {
          errors.push({ message: "Missing semicolon after expression", line: token.line })
        }
      }

      // Check for missing semicolon after control flow keywords
      if (statementEndKeywords.has(token.lexeme)) {
        if (nextToken.lexeme !== ";" && nextToken.lexeme !== "\n") {
          errors.push({ message: `Missing semicolon after '${token.lexeme}'`, line: token.line })
        }
      }

      // Check for missing semicolon after assignment
      if (token.lexeme === "=" || token.lexeme === "+=" || token.lexeme === "-=" ||
          token.lexeme === "*=" || token.lexeme === "/=" || token.lexeme === "%=") {
        let j = i + 1
        while (j < tokens.length && tokens[j].lexeme !== ";" && tokens[j].lexeme !== "{" && 
               tokens[j].lexeme !== "}" && tokens[j].lexeme !== "\n") {
          j++
        }
        if (j < tokens.length && tokens[j].lexeme !== ";") {
          errors.push({ message: "Missing semicolon after assignment", line: token.line })
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Perform basic semantic analysis
function performSemanticAnalysis(tokens: Array<{ lexeme: string; type: string; line: number }>, language: string) {
  const errors: Array<{ message: string; line: number }> = []
    const declaredVariables = new Set<string>()
  const declaredFunctions = new Set<string>()
  let inFunctionScope = false
  const commonGlobals = ["console", "document", "window", "Math", "Array", "Object", "String"]
  const functionScopes: Array<Set<string>> = [new Set()] // Stack of variable scopes

  if (language === "javascript" || language === "typescript" || language === "java") {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const currentScope = functionScopes[functionScopes.length - 1]

      // Track function scope
      if (token.lexeme === "{") {
        functionScopes.push(new Set())
      } else if (token.lexeme === "}") {
        functionScopes.pop()
      }

      // Check function declarations
      if (token.lexeme === "function" && i + 1 < tokens.length && tokens[i + 1].type === "identifier") {
        const funcName = tokens[i + 1].lexeme
        if (declaredFunctions.has(funcName)) {
          errors.push({
            message: `Function '${funcName}' is already declared`,
            line: token.line,
          })
        }
        declaredFunctions.add(funcName)
        inFunctionScope = true
      }

      // Check variable declarations
      if ((token.lexeme === "const" || token.lexeme === "let" || token.lexeme === "var") &&
          i + 1 < tokens.length && tokens[i + 1].type === "identifier") {
        const varName = tokens[i + 1].lexeme
        if (currentScope.has(varName)) {
          errors.push({
            message: `Variable '${varName}' is already declared in this scope`,
            line: token.line,
          })
        }
        currentScope.add(varName)
        declaredVariables.add(varName)
      }

      // Check for use of undeclared variables
      if (token.type === "identifier" && i > 0) {
        const prevToken = tokens[i - 1]
        if (prevToken.lexeme !== "const" && prevToken.lexeme !== "let" && 
            prevToken.lexeme !== "var" && prevToken.lexeme !== "function" &&
            !declaredVariables.has(token.lexeme) && !declaredFunctions.has(token.lexeme)) {
          if (!commonGlobals.includes(token.lexeme) && 
              (i + 1 >= tokens.length || tokens[i + 1].lexeme !== "(")) {
            errors.push({
              message: `Use of undeclared variable '${token.lexeme}'`,
              line: token.line,
            })
          }
        }
      }

      // Check for invalid function calls
      if (token.type === "identifier" && i + 1 < tokens.length && tokens[i + 1].lexeme === "(") {
        if (!declaredFunctions.has(token.lexeme) && !commonGlobals.includes(token.lexeme)) {
          errors.push({
            message: `Function '${token.lexeme}' is not defined`,
            line: token.line,
          })
        }
      }

      // Check for invalid assignments
      if (token.lexeme === "=" && i > 0 && i + 1 < tokens.length) {
        const leftToken = tokens[i - 1]
        const rightToken = tokens[i + 1]
        
        // Check for assignment to const
        if (leftToken.type === "identifier") {
          let j = i - 2
          while (j >= 0 && tokens[j].type !== "keyword") {
            j--
          }
          if (j >= 0 && tokens[j].lexeme === "const") {
            errors.push({
              message: `Cannot assign to constant '${leftToken.lexeme}'`,
              line: token.line,
            })
          }
        }

        if (leftToken.type !== "identifier" && leftToken.type !== "operator") {
          errors.push({
            message: "Invalid assignment target",
            line: token.line,
          })
        }
      }

      // Check for potential null/undefined access
      if (token.lexeme === "." && i > 0 && i + 1 < tokens.length) {
        const leftToken = tokens[i - 1]
        if (leftToken.type === "identifier" && !declaredVariables.has(leftToken.lexeme)) {
          errors.push({
            message: `Potential null/undefined access on '${leftToken.lexeme}'`,
            line: token.line,
          })
        }
      }

      // Check for division by zero
      if (token.lexeme === "/" && i + 1 < tokens.length) {
        const rightToken = tokens[i + 1]
        if (rightToken.type === "number" && Number(rightToken.lexeme) === 0) {
          errors.push({
            message: "Division by zero",
            line: token.line,
          })
        }
      }

      // Check for unreachable code
      if (token.lexeme === "return" || token.lexeme === "throw" || token.lexeme === "break" || token.lexeme === "continue") {
        let j = i + 1
        while (j < tokens.length && tokens[j].lexeme !== ";" && tokens[j].lexeme !== "}") {
          if (tokens[j].type !== "whitespace" && tokens[j].type !== "comment") {
            errors.push({
              message: "Unreachable code after control flow statement",
              line: tokens[j].line,
            })
            break
          }
          j++
        }
      }

      // Check for infinite loops
      if (token.lexeme === "while" && i + 2 < tokens.length) {
        const condition = tokens[i + 2]
        if (condition.type === "keyword" && (condition.lexeme === "true" || condition.lexeme === "false")) {
          errors.push({
            message: "Potential infinite loop with constant condition",
            line: token.line,
          })
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Format code based on language
function formatCode(code: string, language: string) {
  // This is a simplified formatter
  let formatted = code

  // Basic indentation for braces
  if (
    language === "javascript" ||
    language === "typescript" ||
    language === "java" ||
    language === "c" ||
    language === "cpp"
  ) {
    const lines = code.split("\n")
    let indentLevel = 0
    const formattedLines = []

    for (const line of lines) {
      // Trim whitespace
      const trimmedLine = line.trim()

      // Adjust indent level for closing braces at the start of the line
      if (trimmedLine.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      // Add proper indentation
      if (trimmedLine.length > 0) {
        formattedLines.push("  ".repeat(indentLevel) + trimmedLine)
      } else {
        formattedLines.push("")
      }

      // Adjust indent level for opening braces
      if (trimmedLine.endsWith("{")) {
        indentLevel++
      }

      // Handle single-line blocks
      if (trimmedLine.endsWith("}") && !trimmedLine.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
    }

    formatted = formattedLines.join("\n")
  } else if (language === "python") {
    // Python uses indentation for blocks, so we'll just normalize it
    const lines = code.split("\n")
    let indentLevel = 0
    const formattedLines = []

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.endsWith(":")) {
        formattedLines.push("    ".repeat(indentLevel) + trimmedLine)
        indentLevel++
      } else if (
        trimmedLine.startsWith("return") ||
        trimmedLine.startsWith("break") ||
        trimmedLine.startsWith("continue") ||
        trimmedLine.startsWith("pass")
      ) {
        formattedLines.push("    ".repeat(indentLevel) + trimmedLine)
        if (indentLevel > 0) indentLevel--
      } else if (trimmedLine.length === 0) {
        formattedLines.push("")
      } else {
        formattedLines.push("    ".repeat(indentLevel) + trimmedLine)
      }
    }

    formatted = formattedLines.join("\n")
  }

  return formatted
}

// Main analysis function
export async function analyzeCode(code: string, language: string) {
  // Perform lexical analysis
  const tokens = performLexicalAnalysis(code, language)

  // Perform syntax analysis
  const syntaxResults = performSyntaxAnalysis(tokens, language)

  // Perform semantic analysis
  const semanticResults = performSemanticAnalysis(tokens, language)

  // Format code
  const formattedCode = formatCode(code, language)

  // Return all results
  return {
    lexical: {
      tokens,
    },
    syntax: syntaxResults,
    semantic: semanticResults,
    formatted: {
      code: formattedCode,
    },
  }
}
