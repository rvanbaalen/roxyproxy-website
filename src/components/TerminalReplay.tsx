import { useEffect, useRef, useState, useCallback } from "react";

export interface TerminalLine {
  type: "prompt" | "output" | "comment" | "highlight";
  text: string;
}

interface TerminalReplayProps {
  lines: TerminalLine[];
  speed?: number;
  delay?: number;
}

const lineColors: Record<TerminalLine["type"], string> = {
  prompt: "#ccc",
  output: "#ccc",
  comment: "#666",
  highlight: "#f59e0b",
};

function appendLine(container: HTMLElement, line: TerminalLine) {
  const div = document.createElement("div");
  div.style.whiteSpace = "pre";
  div.style.color = lineColors[line.type];
  if (line.type === "prompt") {
    const prompt = document.createElement("span");
    prompt.style.color = "#22c55e";
    prompt.textContent = "$ ";
    div.appendChild(prompt);
    div.appendChild(document.createTextNode(line.text.replace(/^\$\s*/, "")));
  } else {
    div.textContent = line.text;
  }
  container.appendChild(div);
}

export default function TerminalReplay({
  lines,
  speed = 30,
  delay = 200,
}: TerminalReplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<() => void>(() => {});
  const hasRun = useRef(false);
  const [showReplay, setShowReplay] = useState(false);

  const runAnimation = useCallback(() => {
    const container = contentRef.current;
    if (!container || lines.length === 0) return;

    // Clear previous content safely
    while (container.firstChild) container.removeChild(container.firstChild);
    setShowReplay(false);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      lines.forEach((line) => appendLine(container, line));
      setShowReplay(true);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    async function animate() {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i];
        const div = document.createElement("div");
        div.style.whiteSpace = "pre";
        div.style.color = lineColors[line.type];

        if (line.type === "prompt") {
          const prompt = document.createElement("span");
          prompt.style.color = "#22c55e";
          prompt.textContent = "$ ";
          div.appendChild(prompt);

          const textNode = document.createTextNode("");
          div.appendChild(textNode);

          const cursor = document.createElement("span");
          cursor.style.cssText =
            "background:#22c55e;display:inline-block;width:8px;height:15px;vertical-align:text-bottom;margin-left:1px;";
          div.appendChild(cursor);
          const blinkInterval = setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
          }, 530);

          container.appendChild(div);
          container.scrollTop = container.scrollHeight;

          const chars = line.text.replace(/^\$\s*/, "");
          for (let c = 0; c < chars.length; c++) {
            if (cancelled) { clearInterval(blinkInterval); return; }
            textNode.textContent = chars.slice(0, c + 1);
            await new Promise((r) => setTimeout(r, speed));
          }

          clearInterval(blinkInterval);
          cursor.remove();
        } else {
          div.textContent = line.text;
          container.appendChild(div);
          container.scrollTop = container.scrollHeight;
        }

        if (i < lines.length - 1) {
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      if (!cancelled) setShowReplay(true);
    }

    animate();
  }, [lines, speed, delay]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    runAnimation();
    return () => cancelRef.current();
  }, [runAnimation]);

  function handleReplay() {
    cancelRef.current();
    runAnimation();
  }

  return (
    <div className="rounded-lg border border-[#333] overflow-hidden bg-[#1a1a1a] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-[#222]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-[#666] font-mono">Terminal</span>
        {showReplay && (
          <button
            onClick={handleReplay}
            className="ml-auto text-[#ccc] hover:text-[#fff] transition-colors cursor-pointer"
            aria-label="Replay animation"
            title="Replay"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 256 256" fill="currentColor">
              <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L163.31,54.63a80,80,0,1,0,0,146.74,8,8,0,1,1,9.38,13A96,96,0,1,1,195.31,42.63L216,63.31V48a8,8,0,0,1,16,0Z" />
            </svg>
          </button>
        )}
      </div>
      <div
        ref={contentRef}
        className="p-4 font-mono text-[13px] leading-relaxed overflow-x-auto min-h-[120px]"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}
      />
    </div>
  );
}
