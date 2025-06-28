// src/components/FileUpload.jsx

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export function FileUpload({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const inputRef = useRef();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => {
      const all = [...prev, ...selected];
      const unique = [];
      const seen = new Set();
      for (const f of all) {
        const key = f.name + f.size;
        if (!seen.has(key)) {
          unique.push(f);
          seen.add(key);
        }
      }
      // Generate preview URLs for new files
      const previews = {};
      unique.forEach((file) => {
        previews[file.name] = URL.createObjectURL(file);
      });
      setPreviewUrls(previews);
      return unique.slice(0, 8);
    });
    setProgress({});
  };

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const uploadFiles = async () => {
    setUploading(true);
    const results = [];
    const token = localStorage.getItem("token");
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (event) => {
            if (event.lengthComputable) {
              setProgress((prev) => ({
                ...prev,
                [file.name]: Math.round((event.loaded / event.total) * 100),
              }));
            }
          },
        });
        results.push({ file, success: true });
      } catch {
        results.push({ file, success: false });
      }
    }
    setUploading(false);
    if (onUploadComplete) onUploadComplete(results);
    setFiles([]);
    setProgress({});
  };

  // Clean up preview URLs on unmount or when files change
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="flex flex-col items-start space-y-4 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border mx-auto">
      <div className="flex w-full justify-between items-center mb-2">
        <label className="text-lg font-semibold text-gray-900">Upload files</label>
        <button onClick={() => setFiles([])} className="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
      </div>
      <div
        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 cursor-pointer hover:border-blue-400 transition"
        onClick={handleButtonClick}
        onDrop={e => {
          e.preventDefault();
          const dropped = Array.from(e.dataTransfer.files);
          setFiles(prev => {
            const all = [...prev, ...dropped];
            const unique = [];
            const seen = new Set();
            for (const f of all) {
              const key = f.name + f.size;
              if (!seen.has(key)) {
                unique.push(f);
                seen.add(key);
              }
            }
            return unique.slice(0, 8);
          });
          setProgress({});
        }}
        onDragOver={e => e.preventDefault()}
      >
        <div className="flex flex-col items-center">
          <span className="text-4xl text-gray-400 mb-2">⬆️</span>
          <span className="font-medium text-gray-700">Drag 'n' drop files here, or click to select files</span>
          <span className="text-xs text-gray-500 mt-1">You can upload 8 files (up to 8 MB each)</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {files.length > 0 && (
        <div className="w-full mt-4 grid grid-cols-2 gap-4">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col items-center border rounded-md p-2 bg-gray-100">
              {file.type.startsWith("image/") ? (
                <img src={previewUrls[file.name]} alt={file.name} className="w-20 h-20 object-cover rounded mb-1 border" />
              ) : file.type.startsWith("video/") ? (
                <video src={previewUrls[file.name]} className="w-20 h-20 object-cover rounded mb-1 border" muted />
              ) : (
                <span className="text-3xl">📄</span>
              )}
              <span className="text-xs text-gray-700 truncate w-20" title={file.name}>{file.name}</span>
              <span className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <span className="text-[10px] text-blue-600 font-semibold">{progress[file.name] ? `${progress[file.name]}%` : null}</span>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        onClick={uploadFiles}
        disabled={uploading || !files.length}
        className="w-full mt-4"
      >
        {uploading ? "Uploading..." : "Upload to S3"}
      </Button>
    </div>
  );
}
