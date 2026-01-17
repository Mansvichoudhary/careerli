import { useState } from "react";
import { Copy, Check, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

  // Map common language aliases
  const getLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      rb: "ruby",
      sh: "bash",
      yml: "yaml",
    };
    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
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

      {/* Code - Using react-syntax-highlighter for safe rendering */}
      <div className="overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "transparent",
          }}
          lineNumberStyle={{
            minWidth: "2em",
            paddingRight: "1em",
            color: "#6b7280",
            userSelect: "none",
          }}
        >
          {code}
        </SyntaxHighlighter>
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
