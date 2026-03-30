"use client";

import { useState, useEffect, use } from "react";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Rocket, ArrowLeft, Settings2, Image as LucideImage, Loader2 } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EditorPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const resolvedParams = use(searchParams);
  const editSlug = resolvedParams.slug;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editSlug);
  const [coverImage, setCoverImage] = useState("");

  // Fetch existing post data when editing
  useEffect(() => {
    if (!editSlug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/posts/${editSlug}`);
        setTitle(data.title || "");
        setContent(data.content || "");
        setSlug(data.slug || "");
        setStatus(data.status || "DRAFT");
        setCoverImage(data.coverImage || "");
      } catch (err) {
        console.error("Failed to load post:", err);
        alert("Failed to load post for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [editSlug]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!editSlug) {
      setSlug(slugify(v));
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const { data } = await axios.post("/api/upload", {
        filename: file.name,
        contentType: file.type
      });

      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type }
      });

      return data.publicUrl;
    } catch (err) {
      console.error("Upload failed", err);
      return "";
    }
  };

  const savePost = async (publish = false) => {
    setIsSaving(true);
    try {
      const payload = {
        title,
        content,
        slug,
        status: publish ? "PUBLISHED" : status,
        coverImage,
      };

      if (editSlug) {
        await axios.put(`/api/posts/${editSlug}`, payload);
      } else {
        await axios.post("/api/posts", payload);
      }
      alert(editSlug ? "Post updated successfully!" : "Post saved successfully!");
      router.push("/dashboard/posts");
    } catch (err: any) {
      console.error("Save failed", err);
      alert(`Failed to save post: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs uppercase tracking-widest font-bold">Loading Post...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/posts" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Editor / {editSlug ? "Edit Post" : "New Post"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => savePost(false)} 
            disabled={isSaving}
            className="text-zinc-400 hover:text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => savePost(true)} 
            disabled={isSaving}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {editSlug ? "Update Post" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Input 
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post Title" 
            className="text-4xl h-auto font-bold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-zinc-800" 
          />
          
          <TipTapEditor 
            content={content} 
            onChange={setContent} 
            onImageUpload={handleImageUpload} 
          />
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Settings2 className="w-4 h-4" />
              <h3 className="text-xs uppercase font-bold tracking-widest">Settings</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Slug</label>
              <Input 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-8 text-xs" 
              />
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Cover Image</label>
              <div 
                className="border-2 border-dashed border-zinc-800 rounded-lg aspect-video flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    if (input.files?.length) {
                      const url = await handleImageUpload(input.files[0]);
                      setCoverImage(url);
                    }
                  };
                  input.click();
                }}
              >
                {coverImage ? (
                  <img src={coverImage} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <>
                    <LucideImage className="w-6 h-6 mb-2" />
                    <span className="text-[10px]">Upload Cover</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
