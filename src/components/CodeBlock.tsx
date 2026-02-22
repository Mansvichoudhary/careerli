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

const JUDGE0_BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL || "https://ce.judge0.com";
const JUDGE0_RAPIDAPI_KEY = import.meta.env.VITE_JUDGE0_RAPIDAPI_KEY;
const JUDGE0_RAPIDAPI_HOST = import.meta.env.VITE_JUDGE0_RAPIDAPI_HOST;
const POLL_INTERVAL_MS = 1200;
const MAX_POLL_ATTEMPTS = 12;

const buildJudge0Headers = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (JUDGE0_RAPIDAPI_KEY && JUDGE0_RAPIDAPI_HOST) {
    headers["X-RapidAPI-Key"] = JUDGE0_RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] = JUDGE0_RAPIDAPI_HOST;
  }

  return headers;
};

const getLanguage = (lang: string): string => {
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    "c++": "cpp",
  };

  return languageMap[lang.toLowerCase()] || lang.toLowerCase();
};

const getJudge0LanguageId = (lang: string): number | null => {
  const languageIds: Record<string, number> = {
    python: 71,
    javascript: 63,
    typescript: 74,
    java: 62,
    c: 50,
    cpp: 54,
    rust: 73,
    go: 60,
    bash: 46,
    ruby: 72,
  };

  return languageIds[getLanguage(lang)] ?? null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJudge0ErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `Request failed (${response.status}).`;

  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message || data.error || fallback;
  } catch {
    const text = await response.text();
    return text || fallback;
  }
};

const formatExecutionOutput = (result: {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { description?: string | null };
  time?: string | null;
  memory?: number | null;
}): string => {
  const parts: string[] = [];

  if (result.stdout) parts.push(result.stdout.trimEnd());
  if (result.stderr) parts.push(`Error:\n${result.stderr.trimEnd()}`);
  if (result.compile_output) parts.push(`Compiler Output:\n${result.compile_output.trimEnd()}`);
  if (result.message) parts.push(`Message:\n${result.message.trimEnd()}`);

  const status = result.status?.description || "Unknown";
  const metrics = `\n\nStatus: ${status}${result.time ? ` | Time: ${result.time}s` : ""}${result.memory ? ` | Memory: ${result.memory} KB` : ""}`;

  return `${parts.length ? parts.join("\n\n") : "No output."}${metrics}`;
};

const CodeBlock = ({
  code,
  language = "python",
  filename,
  showRunButton = false,
  onRun,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
      setOutput(`This language (${language}) is not supported for Judge0 execution.`);
      return;
    }

    setIsRunning(true);
    setOutput("Running code on Judge0...");

    try {
      const submissionResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
        method: "POST",
        headers: buildJudge0Headers(),
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      });

      if (!submissionResponse.ok) {
        const apiError = await parseJudge0ErrorMessage(submissionResponse);
        throw new Error(`Submission failed: ${apiError}`);
      }

      const submissionData: { token?: string } = await submissionResponse.json();
      if (!submissionData.token) throw new Error("Judge0 token was not returned.");

      for (let attempts = 0; attempts < MAX_POLL_ATTEMPTS; attempts += 1) {
        const resultResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/${submissionData.token}?base64_encoded=false`, {
          headers: buildJudge0Headers(),
        });

        if (!resultResponse.ok) {
          const apiError = await parseJudge0ErrorMessage(resultResponse);
          throw new Error(`Failed to fetch result: ${apiError}`);
        }

        const resultData: {
          status?: { id?: number; description?: string | null };
          stdout?: string | null;
          stderr?: string | null;
          compile_output?: string | null;
          message?: string | null;
          time?: string | null;
          memory?: number | null;
        } = await resultResponse.json();

        if (resultData.status?.id !== 1 && resultData.status?.id !== 2) {
          setOutput(formatExecutionOutput(resultData));
          onRun?.();
          return;
        }

        await sleep(POLL_INTERVAL_MS);
      }

      setOutput("Execution timed out while waiting for Judge0 response.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error.";
      setOutput(`Execution failed: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-code">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {filename && <span className="text-sm text-gray-400 ml-2">{filename}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">{language}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={oneDark}
          showLineNumbers
          customStyle={{ margin: 0, borderRadius: 0, background: "transparent" }}
          lineNumberStyle={{ minWidth: "2em", paddingRight: "1em", color: "#6b7280", userSelect: "none" }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {showRunButton && (
        <div className="border-t border-gray-700 px-4 py-2 bg-gray-800">
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60">
            <Play className="h-4 w-4 mr-1" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      )}

      {output && (
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Terminal className="h-4 w-4" />
            <span>Output</span>
          </div>
          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
