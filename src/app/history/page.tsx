"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MapPin, Download, Trash2, Edit2, Check, X } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";

type Record = {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export default function History() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`/api/weather/${id}`, { method: 'DELETE' });
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (record: Record) => {
    setEditingId(record.id);
    setEditValue(record.locationName);
  };

  const saveEdit = async (id: string) => {
    try {
      await fetch(`/api/weather/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName: editValue })
      });
      setRecords(records.map(r => r.id === id ? { ...r, locationName: editValue } : r));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format: string) => {
    window.location.href = `/api/export?format=${format}`;
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading history...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-6xl md:text-7xl font-display font-extrabold tracking-tighter mb-2">
            <SplitText text="Search History" delay={30} />
          </h1>
          <p className="text-slate-400 font-serif text-xl" style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
            <SplitText text="Manage and export your previous weather lookups." delay={15} delayOffset={300} />
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('json')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-blue-500/20">
            <Download className="w-4 h-4" /> JSON
          </button>
          <button onClick={() => handleExport('csv')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-emerald-500/20">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => handleExport('md')} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-purple-500/20">
            <Download className="w-4 h-4" /> MD
          </button>
        </div>
      </div>

      <div 
        className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-display text-2xl tracking-tight">Location</th>
                <th className="px-6 py-4 font-display text-2xl tracking-tight">Coordinates</th>
                <th className="px-6 py-4 font-display text-2xl tracking-tight">Searched On</th>
                <th className="px-6 py-4 font-display text-2xl tracking-tight text-right">Actions</th>
              </tr>
            </thead>
            <AnimatedList as="tbody" className="divide-y divide-slate-800/50" delay={100} initialDelay={600}>
              {records.length === 0 && (
                <AnimatedListItem as="tr">
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No search history found.</td>
                </AnimatedListItem>
              )}
              {records.map(record => (
                <AnimatedListItem as="tr" key={record.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === record.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 w-full max-w-[200px] text-xl font-display focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(record.id)} className="text-green-400 hover:text-green-300"><Check className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-display text-2xl tracking-tight">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        {record.locationName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-lg font-serif" style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
                    {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-lg font-serif" style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
                    {format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEditing(record)} className="text-slate-400 hover:text-blue-400 transition-colors" title="Edit Location Name">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-400 transition-colors" title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </table>
        </div>
      </div>
    </div>
  );
}
