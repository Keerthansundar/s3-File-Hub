import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FileThumbnail({ fileName, type }) {
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

  if (type === "image") {
    return blobUrl ? (
      <img src={blobUrl} alt={fileName} className="w-24 h-24 object-cover rounded mb-2" />
    ) : (
      <div className="h-24 w-full flex items-center justify-center text-gray-400">Image</div>
    );
  }
  if (type === "video") {
    return blobUrl ? (
      <video src={blobUrl} className="w-24 h-24 object-cover rounded mb-2" controls={false} />
    ) : (
      <div className="h-24 w-full flex items-center justify-center text-gray-400">Video</div>
    );
  }
  return <span className="text-5xl mb-2">📄</span>;
}

export default function AlbumDetails() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState("");
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_BASE_URL}/api/albums/${id}`, { headers })
      .then(res => {
        setAlbum(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Album not found");
        setLoading(false);
      });
  }, [id]);

  const handleRemoveFile = async (fileKey) => {
    setRemoving(fileKey);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE_URL}/api/albums/${id}/remove-file`, { fileKey }, { headers });
      setAlbum((prev) => ({ ...prev, fileKeys: prev.fileKeys.filter(k => k !== fileKey) }));
    } catch {
      // Optionally show error
    }
    setRemoving("");
  };

  const handleShareLink = () => {
    if (album && album.shareCode) {
      navigate(`/shared/${album.shareCode}`);
    } else {
      // fallback: copy link if shareCode is not present
      const link = `${window.location.origin}/album/${id}`;
      navigator.clipboard.writeText(link);
    }
  };

  if (loading) return <Spinner className="my-12" />;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Album: {album.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareLink}>Share Album Link</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {album.fileKeys.length === 0 ? (
          <div className="col-span-full text-gray-400 text-center">No files in this album.</div>
        ) : (
          album.fileKeys.map(key => {
            const ext = key.split('.').pop().toLowerCase();
            const isImage = ["jpg","jpeg","png","gif","bmp","webp"].includes(ext);
            const isVideo = ["mp4","webm","mov","avi","mkv"].includes(ext);
            const type = isImage ? "image" : isVideo ? "video" : "other";
            return (
              <div key={key} className="relative group border rounded p-2 flex flex-col items-center bg-white cursor-pointer"
                onClick={() => setPreviewFile({ fileName: key, type })}
              >
                <FileThumbnail fileName={key} type={type} />
                <span className="text-xs truncate w-24 text-center mb-2">{key}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={e => { e.stopPropagation(); handleRemoveFile(key); }}
                  disabled={removing === key}
                >
                  {removing === key ? "Removing..." : "Remove"}
                </Button>
              </div>
            );
          })
        )}
      </div>
      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={open => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-lg w-full flex flex-col items-center">
          {previewFile && (
            <FilePreview fileName={previewFile.fileName} type={previewFile.type} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilePreview({ fileName, type }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
      .catch(() => setBlobUrl("") );
    return () => {
      if (url) URL.revokeObjectURL(url);
      revoked = true;
    };
  }, [fileName, API_BASE_URL]);

  if (!blobUrl) return <div className="h-96 flex items-center justify-center w-full text-gray-400">Loading...</div>;
  return (
    <>
      {type === "image" ? (
        <img src={blobUrl} alt={fileName} className="rounded max-h-96 object-contain w-full" />
      ) : type === "video" ? (
        <video src={blobUrl} controls className="rounded max-h-96 object-contain w-full" />
      ) : (
        <span className="text-6xl">📄</span>
      )}
      <div className="text-sm font-medium text-center w-full truncate mb-2">{fileName}</div>
      <a href={blobUrl} download className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs flex items-center gap-1 justify-center w-full transition">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v11.25m0 0l-4.5-4.5m4.5 4.5l4.5-4.5M4.5 19.5h15" />
        </svg>
        Download
      </a>
    </>
  );
}
