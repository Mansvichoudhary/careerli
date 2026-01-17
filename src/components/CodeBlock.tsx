import { useState } from "react";
import { Copy, Check, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showRunButton?: boolean;
  onRun?: () => void;
}

const CodeBlock = ({
  code,
  language = "python",
  filename,
  showRunButton = false,
  onRun,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setOutput("Running code...");
    setTimeout(() => {
      setOutput("Output: Code executed successfully!");
      onRun?.();
    }, 1000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    // Keywords
    const keywords = ['def', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'class', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'const', 'let', 'var', 'function', 'async', 'await'];
    const builtins = ['print', 'range', 'len', 'str', 'int', 'float', 'list', 'dict', 'set', 'heapq', 'console'];
    
    let highlighted = code
      // Strings
      .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="text-green-400">$&</span>')
      // Comments
      .replace(/(#.*)$/gm, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\/.*)$/gm, '<span class="text-gray-500">$1</span>');
    
    // Keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-purple-400">$1</span>');
    });
    
    // Builtins
    builtins.forEach(fn => {
      const regex = new RegExp(`\\b(${fn})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-yellow-400">$1</span>');
    });
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');
    
    // Function names
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-blue-400">$1</span>(');
    
    return highlighted;
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-code">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {filename && (
            <span className="text-sm text-gray-400 ml-2">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">{language}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-sm font-mono">
          <code
            className="text-code-foreground"
            dangerouslySetInnerHTML={{
              __html: code
                .split("\n")
                .map(
                  (line, i) =>
                    `<div class="flex"><span class="w-8 text-gray-600 select-none">${i + 1}</span><span>${highlightCode(line)}</span></div>`
                )
                .join(""),
            }}
          />
        </pre>
      </div>

      {/* Run button */}
      {showRunButton && (
        <div className="border-t border-gray-700 px-4 py-2 bg-gray-800">
          <Button
            size="sm"
            onClick={handleRun}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-1" />
            Run Code
          </Button>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Terminal className="h-4 w-4" />
            <span>Output</span>
          </div>
          <pre className="text-sm font-mono text-gray-300">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
