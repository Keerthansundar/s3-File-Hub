// src/pages/UploadFile.jsx

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { FileUpload } from "@/components/FileUpload";
import StorageUsage from "@/components/StorageUsage";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis, PaginationLink } from "@/components/ui/pagination";
import Spinner from "@/components/Spinner";
import { Pointer } from "lucide-react";
import CreateAlbumDialog from "@/components/CreateAlbumDialog";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function getFileTypeIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  return "file";
}

function FileThumbnail({ fileName, type }) {
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
      .catch(() => setBlobUrl(""));
    return () => {
      if (url) URL.revokeObjectURL(url);
      revoked = true;
    };
  }, [fileName, API_BASE_URL]);

  if (type === "image") {
    return blobUrl ? (
      <img src={blobUrl} alt={fileName} className="rounded max-h-28 object-cover" />
    ) : (
      <div className="h-28 w-full flex items-center justify-center text-gray-400">Image</div>
    );
  }
  if (type === "video") {
    return blobUrl ? (
      <video src={blobUrl} className="rounded max-h-28 object-cover" controls={false} />
    ) : (
      <div className="h-28 w-full flex items-center justify-center text-gray-400">Video</div>
    );
  }
  return <span className="text-5xl">📄</span>;
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

function UploadFile({ search = "", setSearch }) {
  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [refreshStorage, setRefreshStorage] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [storageMB, setStorageMB] = useState(0);
  const [deleting, setDeleting] = useState("");
  const [downloading, setDownloading] = useState("");
  const perPage = 10;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/api/files/list`, { headers });
      setFiles(res.data);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileName) => {
    setDeleting(fileName);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}/api/files/delete/${fileName}`, { headers });
      setFiles(prev => prev.filter(f => f !== fileName));
      setRefreshStorage((v) => v + 1);
    } catch {}
    setDeleting("");
  };

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE_URL}/api/files/stats`, { headers });
        setStorageMB(res.data.usedMB);
      } catch {
        setStorageMB(0);
      }
    };

    fetchStorage();
  }, [refreshStorage]);

  const filteredFiles = files.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredFiles.length / perPage);
  const paginatedFiles = filteredFiles.slice((page - 1) * perPage, page * perPage);

  // AWS S3 cost calculation
  const usdPerMB = 0.023 / 1024; // $ per MB
  const inrPerUSD = 83; // 1 USD = 83 INR (2025)
  const costInUSD = storageMB * usdPerMB;
  const costInINR = costInUSD * inrPerUSD;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <StorageUsage refreshTrigger={refreshStorage} />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">File Gallery</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowUpload(true)} className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800">
              + Upload files 
            </Button>
            <Button variant="outline" onClick={() => setShowCreateAlbum(true)}>+ Create Album</Button>
            <Button variant="outline" onClick={() => navigate("/albums")}>Go to Albums 📁</Button>
          </div>
        </div>
        <CreateAlbumDialog open={showCreateAlbum} onClose={() => setShowCreateAlbum(false)} onAlbumCreated={null} />

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg relative p-4 max-h-[90vh] w-full max-w-2xl flex flex-col">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>
              <div className="overflow-y-auto flex-1 pr-2">
                <FileUpload onUploadComplete={() => {
                  setShowUpload(false);
                  fetchFiles();
                  setRefreshStorage((v) => v + 1);
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {loading ? (
          <Spinner className="my-12" />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {paginatedFiles.length === 0 && (
                <div className="col-span-full text-gray-400 text-center">No files found.</div>
              )}
              {paginatedFiles.map(fileName => {
                const type = getFileTypeIcon(fileName);
                return (
                  <div
                    key={fileName}
                    className="relative bg-white rounded-xl shadow border p-3 group flex flex-col items-center cursor-pointer"
                    onClick={() => setPreviewFile({ fileName, type })}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(fileName); }}
                        className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                        title="Delete"
                        disabled={deleting === fileName}
                      >
                        {deleting === fileName ? (
                          <span className="w-5 h-5 inline-block animate-spin border-2 border-red-400 border-t-transparent rounded-full"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6.75A2.25 2.25 0 018.25 4.5h7.5A2.25 2.25 0 0118 6.75V7.5M4.5 7.5h15m-1.5 0v10.125A2.625 2.625 0 0115.375 20.25h-6.75A2.625 2.625 0 016 17.625V7.5m3 4.5v4.125m3-4.125v4.125" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center mb-2 min-h-[120px]">
                      <FileThumbnail fileName={fileName} type={type} />
                    </div>
                    <div className="text-xs font-medium truncate w-full text-center">{fileName}</div>
                    <button
                      className="mt-2 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                      onClick={async e => {
                        e.stopPropagation();
                        const token = localStorage.getItem("token");
                        const res = await fetch(`${API_BASE_URL}/api/files/download/${encodeURIComponent(fileName)}`, {
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });
                        if (!res.ok) return alert("Download failed");
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v11.25m0 0l-4.5-4.5m4.5 4.5l4.5-4.5M4.5 19.5h15" />
                      </svg>
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
            {/* File Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={open => !open && setPreviewFile(null)}>
              <DialogContent className="max-w-lg w-full flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2" id="file-preview-title">File Preview</h2>
                {previewFile && (
                  <FilePreview fileName={previewFile.fileName} type={previewFile.type} />
                )}
              </DialogContent>
            </Dialog>
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8 flex justify-center">
                <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                    className={`cursor-pointer ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => {
                        if (page > 1) setPage(p => Math.max(1, p - 1));
                    }}
                    aria-disabled={page === 1}
                    />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                        className="cursor-pointer"
                    >
                        {i + 1}
                    </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                    className={`cursor-pointer ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => {
                        if (page < totalPages) setPage(p => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={page === totalPages}
                    />
                </PaginationItem>
                </PaginationContent>
            </Pagination>
            )}
            <div className="flex justify-end mt-8">
              <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadFile;
