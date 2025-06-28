import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileCard } from "@/components/FileCard";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";

export default function AlbumPage() {
  const { code } = useParams();
  const [album, setAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/albums/${code}`);
        if (!res.ok) throw new Error("Album not found");
        const data = await res.json();
        setAlbum(data); // backend returns Album only
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Album not found or expired");
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [code]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE}/api/albums/${code}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const uploadedFile = await res.json();
      setFiles(prev => [...prev, uploadedFile]);
      toast.success("File uploaded");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner className="my-12" />;
  if (!album) return <div className="text-center p-6 text-red-500">Album not found or expired.</div>;

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Shared Album: {album.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
            <Button variant="ghost" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}>Share Link</Button>
          </div>
        </div>
        <div className="mb-6 bg-gray-100 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 border border-gray-200">
          <Input
            type="file"
            onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
            className="max-w-xs bg-white border border-gray-300 rounded shadow-sm"
          />
          <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full sm:w-auto">
            {uploading ? "Uploading..." : "Upload to Album"}
          </Button>
          {selectedFile && (
            <span className="text-xs text-gray-600 truncate max-w-xs">{selectedFile.name}</span>
          )}
        </div>
        <div className="border rounded-xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {files.length === 0 ? (
              <div className="col-span-full text-gray-400 text-center py-8">No files in this album yet.</div>
            ) : (
              files.map(file => (
                <FileCard key={file.id || file.name} file={file} apiBaseUrl={API_BASE} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
