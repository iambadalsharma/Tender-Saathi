"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Send } from "lucide-react";

export type Note = {
  id: string;
  resource_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export function NotesModal({
  resourceId,
  resourceType,
  resourceTitle,
  onClose,
}: {
  resourceId: string;
  resourceType: "tenders" | "orders";
  resourceTitle: string;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: true });

      if (data) setNotes(data as Note[]);
      else console.error("Error fetching notes:", error);
      
      setLoading(false);
    }
    fetchNotes();
  }, [resourceId]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        resource_id: resourceId,
        user_id: userData.user.id,
        content: newNote.trim(),
      })
      .select()
      .single();

    if (data) {
      setNotes((prev) => [...prev, data as Note]);
      setNewNote("");
    } else {
      console.error("Error adding note:", error);
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-lg animate-fade-up h-[600px] max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <h3 className="text-lg font-bold text-zinc-900 truncate pr-4">
            Notes: {resourceTitle}
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {loading ? (
            <div className="text-center text-sm text-zinc-500 py-4">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center text-sm text-zinc-500 py-8 italic">No notes yet. Be the first to add one!</div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white rounded border border-zinc-200 p-3 text-sm">
                <p className="whitespace-pre-wrap text-zinc-800">{note.content}</p>
                <p className="text-[10px] text-zinc-400 mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddNote} className="border-t border-zinc-200 p-4 flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note or assign a task..."
            className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-950 resize-none h-11 outline-none focus:border-emerald-600"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote(e as any);
              }
            }}
          />
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="flex h-11 w-11 items-center justify-center rounded bg-emerald-700 text-white disabled:bg-zinc-300 hover:bg-emerald-800 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
