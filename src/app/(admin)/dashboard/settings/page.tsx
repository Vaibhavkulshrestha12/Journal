"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Globe, User, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
  const [blogTitle, setBlogTitle] = useState("JOURNAL.");
  const [blogDescription, setBlogDescription] = useState("A minimal blogging platform.");
  const [authorName, setAuthorName] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a full implementation, this would persist to DB or env
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-zinc-500">Configure your blog's identity and preferences.</p>
      </div>

      {/* General */}
      <section className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Globe className="w-4 h-4" />
          <h2 className="text-xs uppercase font-bold tracking-widest">General</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Blog Title</label>
            <Input
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              className="bg-zinc-900 border-zinc-800 h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Description</label>
            <Input
              value={blogDescription}
              onChange={(e) => setBlogDescription(e.target.value)}
              className="bg-zinc-900 border-zinc-800 h-10"
            />
          </div>
        </div>
      </section>

      {/* Author */}
      <section className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <User className="w-4 h-4" />
          <h2 className="text-xs uppercase font-bold tracking-widest">Author</h2>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Display Name</label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="bg-zinc-900 border-zinc-800 h-10"
          />
        </div>
      </section>

      {/* Social */}
      <section className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 space-y-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Settings className="w-4 h-4" />
          <h2 className="text-xs uppercase font-bold tracking-widest">Social Links</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Twitter / X</label>
            <Input
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="https://x.com/yourhandle"
              className="bg-zinc-900 border-zinc-800 h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500">GitHub</label>
            <Input
              value={socialGithub}
              onChange={(e) => setSocialGithub(e.target.value)}
              placeholder="https://github.com/yourhandle"
              className="bg-zinc-900 border-zinc-800 h-10"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200">
          Save Settings
        </Button>
        {saved && <span className="text-xs text-green-400 font-medium">Settings saved!</span>}
      </div>
    </div>
  );
}
