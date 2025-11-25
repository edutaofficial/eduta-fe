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

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number; // Maximum character count (HTML markup included)
  error?: boolean; // Show error state with red border
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
  error,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [charCount, setCharCount] = React.useState(0);

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
      // Prevent input when at maxLength
      handleKeyDown: (view, event) => {
        if (maxLength && editor) {
          const currentHtml = editor.getHTML();
          const currentLength = currentHtml.length;
          
          // If we're at or over the limit, prevent character insertion
          if (currentLength >= maxLength) {
            // Allow deletion keys (Backspace, Delete)
            if (event.key === 'Backspace' || event.key === 'Delete') {
              return false; // Allow deletion
            }
            // Allow navigation keys
            if (event.key.startsWith('Arrow') || 
                event.key === 'Home' || 
                event.key === 'End' ||
                event.key === 'PageUp' ||
                event.key === 'PageDown') {
              return false; // Allow navigation
            }
            // Allow modifier keys (Ctrl, Alt, Meta) for shortcuts
            if (event.ctrlKey || event.altKey || event.metaKey) {
              return false; // Allow shortcuts
            }
            // Prevent all other keys that would insert text
            if (event.key.length === 1 || event.key === 'Enter') {
              event.preventDefault();
              return true; // Block insertion
            }
          }
        }
        return false; // Use default handler
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      const currentLength = html.length;

      // Truncate if exceeds max length (handles paste operations)
      // Strict check: if currentLength > maxLength, we must truncate
      if (maxLength && currentLength > maxLength) {
        const htmlContent = html;
        
        // Find a safe truncation point (before an HTML tag if possible)
        // Start with maxLength as the target
        let truncateAt = maxLength;
        
        // Try to find a good breaking point (end of a word/tag) within the limit
        // Look backwards from maxLength to find a safe break point
        let safeBreak = truncateAt;
        for (let i = truncateAt - 1; i >= Math.max(0, truncateAt - 50); i--) {
          const char = htmlContent[i];
          if (char === '>' || char === ' ') {
            // Found a safe break point, use position after this character
            safeBreak = i + 1;
            // Ensure we don't exceed maxLength
            if (safeBreak > maxLength) {
              safeBreak = maxLength;
            }
            break;
          }
        }
        // Ensure safeBreak never exceeds maxLength
        truncateAt = Math.min(safeBreak, maxLength);
        
        let truncatedHtml = htmlContent.substring(0, truncateAt);
        
        // Remove any unclosed HTML tags at the end
        const openTagMatches = truncatedHtml.match(/<[^/!][^>]*>/g) || [];
        const closeTagMatches = truncatedHtml.match(/<\/[^>]+>/g) || [];
        
        // Find tags that are opened but not closed
        const tagStack: string[] = [];
        for (const match of openTagMatches) {
          const tagName = match.match(/<(\w+)/)?.[1];
          if (tagName && !match.endsWith('/>')) {
            tagStack.push(tagName);
          }
        }
        
        for (const match of closeTagMatches) {
          const tagName = match.match(/<\/(\w+)/)?.[1];
          if (tagName) {
            const index = tagStack.lastIndexOf(tagName);
            if (index !== -1) {
              tagStack.splice(index, 1);
            }
          }
        }
        
        // Close any remaining open tags, but ensure we stay within limit
        while (tagStack.length > 0 && truncatedHtml.length < maxLength) {
          const tag = tagStack.pop();
          if (tag) {
            const closingTag = `</${tag}>`;
            // Only add if it won't exceed the limit
            if (truncatedHtml.length + closingTag.length <= maxLength) {
              truncatedHtml += closingTag;
            } else {
              // Can't close this tag without exceeding limit, remove the opening tag instead
              truncatedHtml = truncatedHtml.replace(new RegExp(`<${tag}[^>]*>`, 'g'), '');
              break;
            }
          }
        }
        
        // Final check: ensure we're exactly at or under the limit (strict enforcement)
        if (truncatedHtml.length > maxLength) {
          truncatedHtml = truncatedHtml.substring(0, maxLength);
          // Remove any partial tags at the end
          truncatedHtml = truncatedHtml.replace(/<[^>]*$/, '');
        }
        
        // Set the truncated content
        editor.commands.setContent(truncatedHtml);
        html = truncatedHtml;
      }

      // Final safety check: ensure we NEVER exceed maxLength (not even by 1 character)
      // This is a critical check to prevent any edge cases
      if (maxLength && html.length > maxLength) {
        html = html.substring(0, maxLength);
        html = html.replace(/<[^>]*$/, '');
        editor.commands.setContent(html);
      }

      setCharCount(html.length);
      onChange(html);
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      let contentToSet = value;
      
      // Truncate if value exceeds max length (handles external updates)
      if (maxLength && value.length > maxLength) {
        // Simple truncation - remove characters from end
        contentToSet = value.slice(0, maxLength);
        // Try to close any open HTML tags
        const openTags = (contentToSet.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (contentToSet.match(/<\/[^>]*>/g) || []).length;
        if (openTags > closeTags) {
          // Remove unclosed tags at the end
          contentToSet = contentToSet.replace(/<[^/][^>]*>$/, '');
        }
      }
      
      editor.commands.setContent(contentToSet);
      // Update character count based on HTML length
      const html = editor.getHTML();
      setCharCount(html.length);
    }
  }, [value, editor, maxLength]);

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

      {/* Character Counter */}
      {maxLength && (
        <div className="border-t bg-muted/30 px-4 py-2 flex justify-end">
          <span
            className={cn(
              "text-xs font-medium",
              charCount > maxLength
                ? "text-destructive"
                : charCount > maxLength * 0.9
                  ? "text-warning-600"
                  : "text-muted-foreground"
            )}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
