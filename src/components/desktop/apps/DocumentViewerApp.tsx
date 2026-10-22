import React, { useState, useRef } from "react";
import type { Locale } from "../../../lib/i18n";
import { Upload, FileSpreadsheet, Search } from "lucide-react";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/universal";
import mammoth from "mammoth";
import DOMPurify from "dompurify";

interface DocumentViewerAppProps {
  locale: Locale;
}

type DocType = "csv" | "xlsx" | "pdf" | "docx" | "unsupported";

interface LoadedDoc {
  name: string;
  type: DocType;
  url?: string;
  tableData?: string[][];
  htmlContent?: string;
}

export const DocumentViewerApp: React.FC<DocumentViewerAppProps> = () => {
  const [doc, setDoc] = useState<LoadedDoc | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    try {
      if (lowerName.endsWith(".csv")) {
        const text = await file.text();
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
        setDoc({
          name: fileName,
          type: "csv",
          tableData: parsed.data,
        });
      } else if (lowerName.endsWith(".xlsx")) {
        const rawRows = (await readXlsxFile(file)) as unknown as unknown[][];
        const stringRows = Array.isArray(rawRows)
          ? rawRows.map((row) =>
              Array.isArray(row)
                ? row.map((cell) => (cell !== null && cell !== undefined ? String(cell) : ""))
                : []
            )
          : [];
        setDoc({
          name: fileName,
          type: "xlsx",
          tableData: stringRows,
        });
      } else if (lowerName.endsWith(".pdf")) {
        const blobUrl = URL.createObjectURL(file);
        setDoc({
          name: fileName,
          type: "pdf",
          url: blobUrl,
        });
      } else if (lowerName.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const cleanHtml = typeof window !== "undefined" ? DOMPurify.sanitize(result.value) : result.value;
        setDoc({
          name: fileName,
          type: "docx",
          htmlContent: cleanHtml,
        });
      } else {
        setDoc({
          name: fileName,
          type: "unsupported",
        });
      }
    } catch (err) {
      console.error("[DocumentViewer] parse error:", err);
      setDoc({
        name: fileName,
        type: "unsupported",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTableRows = React.useMemo(() => {
    if (!doc?.tableData || doc.tableData.length === 0) return [];
    if (!tableSearch.trim()) return doc.tableData;

    const q = tableSearch.toLowerCase();
    const [header, ...rows] = doc.tableData;
    const matched = rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)));
    return [header, ...matched];
  }, [doc?.tableData, tableSearch]);

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.pdf,.docx"
        onChange={handleFile}
        className="hidden"
      />

      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open Document</span>
          </button>

          {doc && (
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="font-semibold text-white truncate max-w-xs">{doc.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-neutral-400">
                {doc.type}
              </span>
            </div>
          )}
        </div>

        {doc?.tableData && (
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter table rows..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-auto bg-black/40 p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-cyan-300 animate-pulse">
            Parsing document...
          </div>
        ) : !doc ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center text-neutral-500">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">No document open</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Supported formats: CSV, Excel (.xlsx), PDF (.pdf), Word (.docx)
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-colors cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        ) : doc.type === "pdf" && doc.url ? (
          <iframe
            src={doc.url}
            title={doc.name}
            className="w-full h-full rounded-xl border border-white/10 bg-white"
          />
        ) : doc.type === "docx" && doc.htmlContent ? (
          <div className="max-w-3xl mx-auto p-8 rounded-xl bg-neutral-900 border border-white/10 shadow-2xl prose prose-invert max-w-none text-xs leading-relaxed select-text"
            dangerouslySetInnerHTML={{ __html: doc.htmlContent }}
          />
        ) : doc.tableData && doc.tableData.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/60 shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/10 border-b border-white/15 text-neutral-200 font-semibold select-none">
                  {filteredTableRows[0]?.map((col, idx) => (
                    <th key={idx} className="p-2.5 px-3 font-medium whitespace-nowrap">
                      {col || `Col ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono select-text">
                {filteredTableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.04] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 px-3 text-neutral-300 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-neutral-400">
            Cannot display preview for this file format.
          </div>
        )}
      </div>
    </div>
  );
};
