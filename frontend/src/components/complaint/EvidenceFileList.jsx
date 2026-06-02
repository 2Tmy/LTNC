import { useState } from "react";
import { openEvidenceFile } from "../../services/complaintService.js";

const formatSize = (size) => {
  if (!Number.isFinite(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function EvidenceFileList({ files = [] }) {
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  const handleOpen = async (file) => {
    setError("");
    setOpeningId(file.id);
    try {
      await openEvidenceFile(file.id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to open evidence file.");
    } finally {
      setOpeningId(null);
    }
  };

  if (!files.length) {
    return <p className="text-body-sm text-on-surface-variant">No evidence files were uploaded.</p>;
  }

  return (
    <div className="space-y-xs">
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {files.map((file) => (
        <div
          key={file.id || file.name}
          className="flex items-center gap-sm rounded-[0.5rem] border border-outline-variant bg-slate-50 px-sm py-xs"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">attach_file</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm text-on-surface">{file.name}</p>
            <p className="text-body-sm text-on-surface-variant">
              {[file.type || "Uploaded file", formatSize(file.size)].filter(Boolean).join(" | ")}
            </p>
          </div>
          <button
            type="button"
            disabled={!file.id || openingId === file.id}
            onClick={() => handleOpen(file)}
            className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {openingId === file.id ? "Opening..." : "View"}
          </button>
        </div>
      ))}
    </div>
  );
}
