"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

const lowlight = createLowlight(common);
import { 
  Bold, Italic, List, ListOrdered, Code, Image as LucideImage, 
  Heading1, Heading2, Link as LinkIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any, onImageUpload?: (file: File) => Promise<string> }) => {
  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length && onImageUpload) {
        const file = input.files[0];
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-sm">
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-zinc-800" : ""}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-zinc-800" : ""}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-zinc-800" : ""}
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-zinc-800" : ""}
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-zinc-800" : ""}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-zinc-800" : ""}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-zinc-800" : ""}
      >
        <Code className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={setLink} className={editor.isActive("link") ? "bg-zinc-800" : ""}>
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addImage}>
        <LucideImage className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function TipTapEditor({ content, onChange, onImageUpload }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Write something remarkable..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] py-4",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full border border-zinc-800 rounded-lg overflow-hidden bg-black">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} className="px-4" />
    </div>
  );
}
