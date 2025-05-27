// This is my lexical analyzer for the compiler design assignment! Works for different languages
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

// finally got my lexical analysis to work! breaks code into meaningful tokens
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
        pattern.lastIndex = 0 // gotta reset regex state or it breaks!
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
        // just skip stuff we don't recognize - not ideal but whatever
        position++
      }
    }
  })

  return tokens
}

// The syntax analysis part was the hardest for this assignment!
function performSyntaxAnalysis(tokens: Array<{ lexeme: string; type: string; line: number }>, language: string) {
  const errors: Array<{ message: string; line: number }> = []
    const stack: Array<{ char: string; line: number }> = []

  // Reserved keywords - these can't be used as variable names 
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

  // Keywords that should have semicolons after them
  const statementEndKeywords = new Set([
    "break", "continue", "return", "throw"
  ])

  // check for matching brackets and parentheses
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

    // for unclosed brackets and parentheses
    for (const item of stack) {
      let message = "Unclosed "
      if (item.char === "{") message += "brace"
      else if (item.char === "[") message += "bracket"
      else if (item.char === "(") message += "parenthesis"
    errors.push({ message, line: item.line })
  }

  // Language-specific checks 
  if (language === "javascript" || language === "typescript" || language === "java") {
    // check if people are trying to use reserved keywords as variables (classic mistake)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      
      
      if (token.type === "identifier" && reservedKeywords.has(token.lexeme)) {
        //Allow if it's part of a property access (e.g., obj.int)
        if (i > 0 && tokens[i - 1].lexeme === ".") {
          continue
        }
        errors.push({ 
          message: `'${token.lexeme}' is a reserved keyword and cannot be used as a variable name`, 
          line: token.line 
        })
      }

      // Check variable declarations with reserved keywords
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

    // function declarations need a name after the keyword - common beginner mistake
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "function" && tokens[i + 1].type !== "identifier") {
        errors.push({ message: "Invalid function declaration", line: tokens[i].line })
      }
    }

    // variable declarations should have a variable name (duh!)
    for (let i = 0; i < tokens.length - 2; i++) {
      if ((tokens[i].lexeme === "const" || tokens[i].lexeme === "let" || tokens[i].lexeme === "var") &&
          tokens[i + 1].type !== "identifier") {
        errors.push({ message: "Invalid variable declaration", line: tokens[i].line })
      }
    }

    // OMG I hate when people write bad operators
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].type === "operator" && tokens[i + 1].type === "operator") {
        // Some operators can be combined tho
        const validCombinations = ["++", "--", "==", "!=", "<=", ">=", "&&", "||", "+=", "-=", "*=", "/=", "%="]
        const combined = tokens[i].lexeme + tokens[i + 1].lexeme
        if (!validCombinations.includes(combined)) {
          errors.push({ message: "Invalid operator combination", line: tokens[i].line })
        }
      }
    }

    // Double semicolons are just sloppy coding
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === ";" && tokens[i + 1].lexeme === ";") {
        errors.push({ message: "Multiple semicolons", line: tokens[i].line })
      }
    }

    // Control structures should be properly formed (if (...) not if ...)
    const controlKeywords = ["if", "else", "for", "while", "do", "switch", "case", "default", "try", "catch", "finally"]
    for (let i = 0; i < tokens.length - 1; i++) {
      if (controlKeywords.includes(tokens[i].lexeme)) {
        // except some don't need parentheses
        if (tokens[i + 1].lexeme !== "(" && tokens[i].lexeme !== "else" && tokens[i].lexeme !== "default") {
          errors.push({ message: `Missing parentheses after '${tokens[i].lexeme}'`, line: tokens[i].line })
        }
      }
    }

    // Objects should have proper property definitions
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "{" && tokens[i + 1].lexeme === "}") {
        // Empty objects are fine, but weird property syntax isn't
        if (i + 2 < tokens.length && tokens[i + 2].type === "identifier" && tokens[i + 3].lexeme !== ":") {
          errors.push({ message: "Invalid object property syntax", line: tokens[i].line })
        }
      }
    }

    // checking array literals bc my professor marks down for bad array syntax
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].lexeme === "[" && tokens[i + 1].lexeme === "]") {
        // Empty array is valid, but trailing commas are weird
        if (i + 2 < tokens.length && tokens[i + 2].lexeme === ",") {
          errors.push({ message: "Invalid array element syntax", line: tokens[i].line })
        }
      }
    }

    // String literals should start with quotes! Had to explain this to my lab partner lol
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "string") {
        const str = tokens[i].lexeme
        if (!str.startsWith('"') && !str.startsWith("'")) {
          errors.push({ message: "Invalid string literal", line: tokens[i].line })
        }
      }
    }

    // NaN numbers are technically invalid
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "number") {
        const num = tokens[i].lexeme
        if (isNaN(Number(num))) {
          errors.push({ message: "Invalid number literal", line: tokens[i].line })
        }
      }
    }

    // Semicolons are required! My team lost points for forgetting these
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i]
      const nextToken = tokens[i + 1]

      // check variable declarations
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

      // expressions need semicolons too! easy to forget
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

      // return, break etc definitely need semicolons
      if (statementEndKeywords.has(token.lexeme)) {
        if (nextToken.lexeme !== ";" && nextToken.lexeme !== "\n") {
          errors.push({ message: `Missing semicolon after '${token.lexeme}'`, line: token.line })
        }
      }

      // check for missing semicolon after assignment (super common mistake)
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

// semantic analysis is the interesting part - finds logical errors rather than just syntax
function performSemanticAnalysis(tokens: Array<{ lexeme: string; type: string; line: number }>, language: string) {
  const errors: Array<{ message: string; line: number }> = []
    const declaredVariables = new Set<string>()
  const declaredFunctions = new Set<string>()
  let inFunctionScope = false
  const commonGlobals = ["console", "document", "window", "Math", "Array", "Object", "String"]
  const functionScopes: Array<Set<string>> = [new Set()] // stacking scopes like we learned in class

  if (language === "javascript" || language === "typescript" || language === "java") {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const currentScope = functionScopes[functionScopes.length - 1]

      // gotta track scope for variables
      if (token.lexeme === "{") {
        functionScopes.push(new Set())
      } else if (token.lexeme === "}") {
        functionScopes.pop()
      }

      // Check for redeclared functions (Not allowed in strict mode!)
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

      // can't declare the same variable twice in the same scope - classic mistake
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

      // using variables before declaring them is bad practice!
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

      // calling undefined functions (everyone does this at some point)
      if (token.type === "identifier" && i + 1 < tokens.length && tokens[i + 1].lexeme === "(") {
        if (!declaredFunctions.has(token.lexeme) && !commonGlobals.includes(token.lexeme)) {
          errors.push({
            message: `Function '${token.lexeme}' is not defined`,
            line: token.line,
          })
        }
      }

      // the assignment operator needs a valid target
      if (token.lexeme === "=" && i > 0 && i + 1 < tokens.length) {
        const leftToken = tokens[i - 1]
        const rightToken = tokens[i + 1]
        
        // Can't reassign const variables! Spent hours debugging this once
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

      // null/undefined accesses cause runtime errors - gotta catch these!
      if (token.lexeme === "." && i > 0 && i + 1 < tokens.length) {
        const leftToken = tokens[i - 1]
        if (leftToken.type === "identifier" && !declaredVariables.has(leftToken.lexeme)) {
          errors.push({
            message: `Potential null/undefined access on '${leftToken.lexeme}'`,
            line: token.line,
          })
        }
      }

      // division by zero - classic programming error from CS101
      if (token.lexeme === "/" && i + 1 < tokens.length) {
        const rightToken = tokens[i + 1]
        if (rightToken.type === "number" && Number(rightToken.lexeme) === 0) {
          errors.push({
            message: "Division by zero",
            line: token.line,
          })
        }
      }

      // code after return/break/etc is never reached!
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

      // while(true) will run forever unless there's a break - probably a mistake
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

// my code formatter - Prof said this is worth extra points!
function formatCode(code: string, language: string) {
  let formatted = code;
  const lines = code.split("\n");
  const formattedLines = [];
  let indentLevel = 0;

  if (language === "javascript" || language === "typescript" || language === "java" || language === "c" || language === "cpp") {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.length === 0) {
        // keep empty lines for readability
        formattedLines.push("");
        continue;
      }
      
      // closing braces reduce indentation (learned this from style guides)
      if (trimmedLine.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1); 
      }
      
      // these regex patterns make the code look so much nicer!
      let formattedLine = trimmedLine
        // spaces after commas are a must
        .replace(/,([^\s])/g, ", $1")
        // spaces after semicolons in for loops look cleaner
        .replace(/;([^\s])/g, "; $1")
        // spaces around operators - our TA was strict about this
        .replace(/([^\s])([+\-*/%=<>!&|^]|==|===|!=|!==|>=|<=|&&|\|\||\+=|-=|\*=|\/=)([^\s=])/g, "$1 $2 $3")
        // fix double spaces that regex might create
        .replace(/\s+([+\-*/%=<>!&|^]|==|===|!=|!==|>=|<=|&&|\|\||\+=|-=|\*=|\/=)\s+/g, " $1 ");
      
      // add proper indentation (using 2 spaces, not tabs!)
      formattedLines.push("  ".repeat(indentLevel) + formattedLine);
      
      // opening braces increase indentation level
      if (trimmedLine.endsWith("{")) {
        indentLevel++;
      }
      
      // handle one-liners with multiple braces
      const openBraces = (trimmedLine.match(/{/g) || []).length;
      const closeBraces = (trimmedLine.match(/}/g) || []).length;
      
      // balance indentation for complex lines
      if (openBraces > 0 && closeBraces > 0 && !trimmedLine.startsWith("}") && !trimmedLine.endsWith("{")) {
        indentLevel += openBraces - closeBraces;
      }
    }
  } else if (language === "python") {
    // Python is weird with its whitespace-based syntax
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.length === 0) {
        formattedLines.push("");
        continue;
      }
      
      // python-specific formatting patterns
      let formattedLine = trimmedLine
        // spaces after commas
        .replace(/,([^\s])/g, ", $1")
        // spaces around operators (PEP8 style guide)
        .replace(/([^\s])([+\-*/%=<>!&|^]|==|!=|>=|<=|and|or|not)([^\s=])/g, "$1 $2 $3")
        // fix any double spaces
        .replace(/\s+([+\-*/%=<>!&|^]|==|!=|>=|<=|and|or|not)\s+/g, " $1 ");
      
      // colons start new blocks in Python
      if (i > 0 && lines[i-1].trim().endsWith(":")) {
        indentLevel++;
      }
      

      if (trimmedLine.startsWith("return") || trimmedLine.startsWith("break") || 
          trimmedLine.startsWith("continue") || trimmedLine.startsWith("pass")) {
        if (indentLevel > 0 && i < lines.length - 1) {
          const nextLine = lines[i+1].trim();
          if (!nextLine.startsWith("elif") && !nextLine.startsWith("else") && 
              !nextLine.startsWith("except") && !nextLine.startsWith("finally")) {
            formattedLines.push("    ".repeat(indentLevel) + formattedLine);
            indentLevel--;
            continue;
          }
        }
      }
      
      // Python uses 4 spaces per indentation level
      formattedLines.push("    ".repeat(indentLevel) + formattedLine);
    }
  }

  return formattedLines.join("\n");
}

// main function that ties everything together -  the compiler driver
export async function analyzeCode(code: string, language: string) {
  // step 1: tokenize the code
  const tokens = performLexicalAnalysis(code, language)

  // step 2: check for syntax errors
  const syntaxResults = performSyntaxAnalysis(tokens, language)

  // step 3: then  for semantic errors
  const semanticResults = performSemanticAnalysis(tokens, language)

  // step 4: then format the code nicely
  const formattedCode = formatCode(code, language)
   
  // then return all our analysis results
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
