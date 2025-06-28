import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FileThumbnail({ fileName, type }) {
  const [blobUrl, setBlobUrl] = useState("");
  useEffect(() => {
    let url = "";
    let revoked = false;
    fetch(`${API_BASE_URL}/api/files/download/${encodeURIComponent(fileName)}`)
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

function FilePreview({ fileName, type }) {
  const [blobUrl, setBlobUrl] = useState("");
  useEffect(() => {
    let url = "";
    let revoked = false;
    fetch(`${API_BASE_URL}/api/files/download/${encodeURIComponent(fileName)}`)
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

export default function SharedAlbum() {
  const { shareCode } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/albums/shared/${shareCode}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setAlbum(data);
        setLoading(false);
      })
      .catch(() => {
        setError("This shared album is expired or invalid.");
        setLoading(false);
      });
  }, [shareCode]);

  if (loading) return <Spinner className="my-12" />;
  if (error || !album) return <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-xl shadow text-center text-red-500">{error || "Album not found."}</div>;

  const expiresSoon = album.expiresAt && (new Date(album.expiresAt) - Date.now() < 24 * 60 * 60 * 1000);
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <Card className="max-w-2xl w-full mx-auto mt-8 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-2xl font-bold mb-1">{album.name}</h2>
            <div className="text-xs text-gray-500">
              Expires: {formatDateTime(album.expiresAt)}
              {expiresSoon && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Expires Soon</span>}
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0 items-center">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Share link copied!");
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied!" : "Copy Share Link"}
            </Button>
            <Button variant="outline" onClick={() => setShowQR(q => !q)}>
              {showQR ? "Hide QR" : "Share via QR Code"}
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>Back</Button>
          </div>
        </div>
        {showQR && (
          <div className="flex justify-center my-4">
            <QRCode value={shareUrl} size={160} />
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
          {album.fileKeys && album.fileKeys.length > 0 ? (
            album.fileKeys.map(key => {
              const ext = key.split('.').pop().toLowerCase();
              const isImage = ["jpg","jpeg","png","gif","bmp","webp"].includes(ext);
              const isVideo = ["mp4","webm","mov","avi","mkv"].includes(ext);
              const type = isImage ? "image" : isVideo ? "video" : "other";
              return (
                <Card key={key} className="flex flex-col items-center p-3 bg-white border rounded-xl shadow-sm cursor-pointer"
                  onClick={() => setPreviewFile({ fileName: key, type })}
                >
                  <FileThumbnail fileName={key} type={type} />
                  <span className="text-xs truncate w-24 text-center mb-2">{key}</span>
                  <button
                    className="mt-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                    onClick={async e => {
                      e.stopPropagation();
                      const res = await fetch(`${API_BASE_URL}/api/files/download/${encodeURIComponent(key)}`);
                      if (!res.ok) return alert("Download failed");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = key;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    Download
                  </button>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-gray-400 text-center">No files in this album.</div>
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
      </Card>
    </div>
  );
}
