"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  HeadingIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countWords, truncateHtmlByWords } from "@/lib/textUtils";
import { useToast } from "@/components/ui/toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minWords?: number; // Minimum word count (for course details: 1000)
  maxWords?: number; // Maximum word count (for course details: 3000, others: 100)
  error?: boolean; // Show error state with red border
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minWords,
  maxWords,
  error,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [wordCount, setWordCount] = React.useState(0);
  const { showToast } = useToast();
  
  // Track if we've already shown toast for word limit to avoid spam
  const wordLimitToastShownRef = React.useRef(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3",
      },
      // Prevent input when at maxWords
      handleKeyDown: (view, event) => {
        if (!editor || !maxWords) return false;
        
        const currentHtml = editor.getHTML();
        const currentWordCount = countWords(currentHtml);
        
        // Check word limit
        const isAtWordLimit = currentWordCount >= maxWords;
        
        // If we're at word limit, prevent character insertion
        if (isAtWordLimit) {
          // Allow deletion keys (Backspace, Delete)
          if (event.key === "Backspace" || event.key === "Delete") {
            // Reset toast flag when deleting
            wordLimitToastShownRef.current = false;
            return false; // Allow deletion
          }
          // Allow navigation keys
          if (event.key.startsWith("Arrow") || 
              event.key === "Home" || 
              event.key === "End" ||
              event.key === "PageUp" ||
              event.key === "PageDown") {
            return false; // Allow navigation
          }
          // Allow modifier keys (Ctrl, Alt, Meta) for shortcuts
          if (event.ctrlKey || event.altKey || event.metaKey) {
            return false; // Allow shortcuts
          }
          // Prevent all other keys that would insert text
          if (event.key.length === 1 || event.key === "Enter") {
            event.preventDefault();
            
            // Show toast for word limit (only once)
            if (!wordLimitToastShownRef.current) {
              showToast(
                `Word limit reached! You cannot add more than ${maxWords} words.`,
                "warning",
                4000
              );
              wordLimitToastShownRef.current = true;
            }
            
            return true; // Block insertion
          }
        } else {
          // Reset toast flag when not at limit
          wordLimitToastShownRef.current = false;
        }
        
        return false; // Use default handler
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      let words = countWords(html);
      
      // Strictly enforce word limit - truncate if exceeded
      if (maxWords && words > maxWords) {
        // Show toast if we exceeded word limit
        if (!wordLimitToastShownRef.current) {
          showToast(
            `Word limit reached! Maximum ${maxWords} words allowed. Content has been truncated.`,
            "warning",
            4000
          );
          wordLimitToastShownRef.current = true;
        }
        
        // Truncate HTML to exactly maxWords while preserving formatting
        html = truncateHtmlByWords(html, maxWords);
        words = countWords(html);
        
        // Update editor with truncated content
        editor.commands.setContent(html);
      } else {
        // Reset toast flag when under limit
        wordLimitToastShownRef.current = false;
      }
      
      setWordCount(words);
      onChange(html);
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      let contentToSet = value;
      
      // Truncate if value exceeds word limit (handles external updates)
      if (maxWords) {
        const wordCount = countWords(value);
        if (wordCount > maxWords) {
          contentToSet = truncateHtmlByWords(value, maxWords);
        }
      }
      
      editor.commands.setContent(contentToSet);
      // Update word count
      const html = editor.getHTML();
      setWordCount(countWords(html));
    }
  }, [value, editor, maxWords]);

  if (!editor || !isMounted) {
    return (
      <div
        className={cn(
          "border rounded-lg overflow-hidden min-h-[200px] bg-background",
          className
        )}
      >
        <div className="border-b bg-muted/30 p-2 flex items-center gap-1 flex-wrap">
          <Button type="button" variant="ghost" size="sm" disabled>
            <BoldIcon className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            <ItalicIcon className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            <ListIcon className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            <ListOrderedIcon className="size-4" />
          </Button>
        </div>
        <div className="min-h-[200px] px-4 py-3 text-muted-foreground">
          {placeholder || "Loading editor..."}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        error
          ? "border-destructive border-2 focus-within:ring-2 focus-within:ring-destructive/50"
          : "focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400",
        className
      )}
    >
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex items-center gap-1 flex-wrap">
        {/* Heading Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                editor.isActive("heading") ? "bg-muted" : "",
                "gap-1"
              )}
            >
              <HeadingIcon className="size-4" />
              <span className="text-xs">
                {editor.isActive("heading", { level: 1 }) && "H1"}
                {editor.isActive("heading", { level: 2 }) && "H2"}
                {editor.isActive("heading", { level: 3 }) && "H3"}
                {!editor.isActive("heading") && "H"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant={!editor.isActive("heading") ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Normal Text
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive("heading", { level: 1 })
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="justify-start"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                Heading 1
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive("heading", { level: 2 })
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="justify-start"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                Heading 2
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive("heading", { level: 3 })
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="justify-start"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                Heading 3
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <BoldIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <ItalicIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <ListIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrderedIcon className="size-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        placeholder={placeholder}
        className="min-h-[200px] max-h-[400px] overflow-y-auto"
      />

      {/* Word Counter */}
      {(minWords || maxWords) && (
        <div className="border-t bg-muted/30 px-4 py-2 flex justify-end">
          <span
            className={cn(
              "text-xs font-medium",
              (minWords && wordCount < minWords) || (maxWords && wordCount > maxWords)
                ? "text-destructive"
                : (maxWords && wordCount > maxWords * 0.9) || (minWords && wordCount < minWords * 1.1)
                  ? "text-warning-600"
                  : "text-muted-foreground"
            )}
          >
            {wordCount.toLocaleString()}
            {minWords && maxWords
              ? `/${minWords.toLocaleString()}-${maxWords.toLocaleString()}`
              : minWords
                ? `/${minWords.toLocaleString()}+`
                : maxWords
                  ? `/${maxWords.toLocaleString()}`
                  : ""}{" "}
            words
            {minWords && wordCount < minWords && (
              <span className="ml-1 text-destructive">
                (At least {minWords.toLocaleString()} words required)
              </span>
            )}
            {maxWords && wordCount > maxWords && (
              <span className="ml-1 text-destructive">
                (Maximum {maxWords.toLocaleString()} words allowed)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
