import { useMemo, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function FileCard({ file }) {
  // file: { name, size, type, lastModified }
  const fileUrl = `${API_BASE_URL}/api/files/download/${encodeURIComponent(file.name)}`;
  const type = useMemo(() => {
    if (file.type) return file.type;
    const ext = file.name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
      return "image";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx"].includes(ext)) return "excel";
    return "file";
  }, [file]);

  // For protected files, fetch as blob with Authorization header
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => {
    let url = "";
    let revoked = false;
    if (type === "image" || type === "video") {
      const token = localStorage.getItem("token");
      fetch(fileUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch file");
          return res.blob();
        })
        .then((blob) => {
          if (!revoked) {
            url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          }
        })
        .catch(() => setPreviewUrl(""));
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
      revoked = true;
    };
    // eslint-disable-next-line
  }, [file.name, API_BASE_URL]);

  const getPreview = () => {
    if (type.startsWith("image")) {
      return previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="rounded max-h-24 max-w-full object-cover mb-2 border"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/vite.svg";
          }}
        />
      ) : (
        <div className="h-24 w-full flex items-center justify-center text-gray-400">
          Image
        </div>
      );
    }
    if (type.startsWith("video")) {
      return previewUrl ? (
        <video
          src={previewUrl}
          className="rounded max-h-24 max-w-full object-cover mb-2 border"
          controls={true}
          muted
        />
      ) : (
        <div className="h-24 w-full flex items-center justify-center text-gray-400">
          Video
        </div>
      );
    }
    if (type === "pdf") {
      return <span className="text-4xl mb-3">📄</span>;
    }
    if (type === "word") {
      return <span className="text-4xl mb-3">📃</span>;
    }
    if (type === "excel") {
      return <span className="text-4xl mb-3">📊</span>;
    }
    return <span className="text-4xl mb-3">📁</span>;
  };

  // Download button for all file types
  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(fileUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return alert("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-md hover:shadow-lg transition-all duration-200 w-36">
      {getPreview()}
      <div
        className="text-sm font-medium text-center text-gray-800 dark:text-gray-200 truncate w-full"
        title={file.name}
      >
        {file.name}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {(file.size / 1024 / 1024).toFixed(2)} MB
      </div>
      <div className="text-xs text-gray-400">
        {file.lastModified
          ? new Date(file.lastModified).toLocaleDateString()
          : ""}
      </div>
      <button
        onClick={handleDownload}
        className="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
      >
        Download
      </button>
    </div>
  );
}
