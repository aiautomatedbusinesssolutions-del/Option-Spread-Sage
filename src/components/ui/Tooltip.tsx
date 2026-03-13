import { useState, useRef, useEffect, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

/**
 * Hover tooltip that shows a plain-English explanation.
 * Wraps any inline content with a dotted underline hint.
 */
export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // If too close to the top, show tooltip below
      setAbove(rect.top > 120);
    }
  }, [show]);

  // If no text, render children without tooltip behavior
  if (!text) {
    return <span>{children}</span>;
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-help"
      tabIndex={0}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      onTouchStart={() => setShow((s) => !s)}
    >
      <span className="border-b border-dotted border-slate-500">{children}</span>
      {show && (
        <span
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-56 px-3 py-2 text-xs leading-relaxed text-slate-200 bg-slate-800 border border-slate-700 rounded-lg shadow-xl ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {text}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-slate-700 rotate-45 ${
              above
                ? "top-full -mt-1 border-b border-r"
                : "bottom-full -mb-1 border-t border-l"
            }`}
          />
        </span>
      )}
    </span>
  );
}
