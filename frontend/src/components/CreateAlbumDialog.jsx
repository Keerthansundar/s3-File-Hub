import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/Spinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FileThumbnail({ fileName }) {
  const [blobUrl, setBlobUrl] = useState("");
  useEffect(() => {
    let url = "";
    let revoked = false;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/files/download/${encodeURIComponent(fileName)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.blob();
      })
      .then((blob) => {
        if (!revoked) {
          url = URL.createObjectURL(blob);
          setBlobUrl(url);
        }
      })
      .catch(() => setBlobUrl(""));
    return () => {
      if (url) URL.revokeObjectURL(url);
      revoked = true;
    };
  }, [fileName]);

  const ext = fileName.split('.').pop().toLowerCase();
  const isImage = ["jpg","jpeg","png","gif","bmp","webp"].includes(ext);
  const isVideo = ["mp4","webm","mov","avi","mkv"].includes(ext);
  if (isImage) {
    return blobUrl ? (
      <img src={blobUrl} alt={fileName} className="w-16 h-16 object-cover rounded" />
    ) : (
      <div className="h-16 w-16 flex items-center justify-center text-gray-400">Image</div>
    );
  }
  if (isVideo) {
    return blobUrl ? (
      <video src={blobUrl} className="w-16 h-16 object-cover rounded" controls={false} />
    ) : (
      <div className="h-16 w-16 flex items-center justify-center text-gray-400">Video</div>
    );
  }
  return <span className="text-3xl">📄</span>;
}

export default function CreateAlbumDialog({ open, onClose, onAlbumCreated }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      axios.get(`${API_BASE_URL}/api/files/list`, { headers }).then(res => setFiles(res.data)).catch(() => setFiles([]));
      setSelectedFiles([]);
      setAlbumName("");
      setError("");
    }
  }, [open]);

  const handleFileSelect = (key) => {
    setSelectedFiles(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleCreate = async () => {
    if (!albumName.trim() || selectedFiles.length === 0) {
      setError("Album name and at least one file required.");
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE_URL}/api/albums`, {
        name: albumName,
        fileKeys: selectedFiles,
      }, { headers });
      setCreating(false);
      onAlbumCreated && onAlbumCreated(res.data);
      onClose();
    } catch {
      setError("Failed to create album.");
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl  w-full">
        <DialogHeader>
          <DialogTitle>Create Album</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Input
            placeholder="Album name"
            value={albumName}
            onChange={e => setAlbumName(e.target.value)}
            className="mb-2"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
            {files.length === 0 && <div className="col-span-full text-gray-400">No files available</div>}
            {files.map((key) => (
              <label key={key} className={`flex flex-col items-center cursor-pointer border rounded p-1 ${selectedFiles.includes(key) ? 'ring-2 ring-blue-500' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(key)}
                  onChange={() => handleFileSelect(key)}
                  className="mb-1"
                />
                <FileThumbnail fileName={key} />
                <span className="text-xs truncate w-16 text-center">{key}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={creating}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating || !albumName.trim() || selectedFiles.length === 0}>
            {creating ? <Spinner size="sm" /> : "Create Album"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
