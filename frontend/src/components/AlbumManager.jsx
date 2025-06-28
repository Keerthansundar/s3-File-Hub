import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/Spinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AlbumManager() {
  const [albums, setAlbums] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch albums
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/api/albums`, { headers });
      setAlbums(res.data);
    } catch {
      setAlbums([]);
    }
    setLoading(false);
  };

  // Fetch files for selection
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/api/files/list`, { headers });
      setFiles(res.data);
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchFiles();
  }, []);

  const handleFileSelect = (key) => {
    setSelectedFiles((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim() || selectedFiles.length === 0) return;
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE_URL}/api/albums`, {
        name: albumName,
        fileKeys: selectedFiles,
      }, { headers });
      setAlbumName("");
      setSelectedFiles([]);
      fetchAlbums();
    } catch {}
    setCreating(false);
  };

  const handleDeleteAlbum = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}/api/albums/${id}`, { headers });
      fetchAlbums();
    } catch {}
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 my-8">
      <h3 className="text-xl font-bold mb-4">Album Manager</h3>
      {/* Create Album */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Album name"
            value={albumName}
            onChange={e => setAlbumName(e.target.value)}
            className="w-1/2"
          />
          <Button onClick={handleCreateAlbum} disabled={creating || !albumName.trim() || selectedFiles.length === 0}>
            {creating ? <Spinner size="sm" /> : "Create Album"}
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {files.length === 0 && <div className="col-span-full text-gray-400">No files available</div>}
          {files.map((key) => (
            <label key={key} className={`flex flex-col items-center cursor-pointer border rounded p-1 ${selectedFiles.includes(key) ? 'ring-2 ring-blue-500' : ''}`}>
              <input
                type="checkbox"
                checked={selectedFiles.includes(key)}
                onChange={() => handleFileSelect(key)}
                className="mb-1"
              />
              <img
                src={`${API_BASE_URL}/api/files/preview-url/${key}`}
                alt={key}
                className="w-16 h-16 object-cover rounded"
                onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
              />
              <span className="text-xs truncate w-16 text-center">{key}</span>
            </label>
          ))}
        </div>
      </div>
      {/* List Albums */}
      <h4 className="font-semibold mb-2">Your Albums</h4>
      {loading ? (
        <Spinner className="my-8" />
      ) : albums.length === 0 ? (
        <div className="text-gray-400">No albums found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map(album => (
            <div key={album.id} className="border rounded p-3 flex flex-col bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{album.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAlbum(album.id)}
                  disabled={deletingId === album.id}
                >
                  {deletingId === album.id ? <Spinner size="sm" /> : "Delete"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {album.fileKeys.map(key => (
                  <img
                    key={key}
                    src={`${API_BASE_URL}/api/files/preview-url/${key}`}
                    alt={key}
                    className="w-10 h-10 object-cover rounded"
                    onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">{album.fileKeys.length} file(s)</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
