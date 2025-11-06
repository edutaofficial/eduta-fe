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
  maxLength?: number; // Maximum character count (plain text)
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
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
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const currentLength = text.length;
      
      setCharCount(currentLength);
      
      // Prevent exceeding max length
      if (maxLength && currentLength > maxLength) {
        // Don't allow the change
        return false;
      }
      
      onChange(html);
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      // Update character count
      const text = editor.getText();
      setCharCount(text.length);
    }
  }, [value, editor]);

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
        "border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400",
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
