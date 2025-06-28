import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AlbumsList() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchAlbums();
  }, []);

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Albums</h2>
        <Button variant="ghost" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
      {loading ? (
        <Spinner className="my-12" />
      ) : albums.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No albums found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {albums.map(album => (
            <Card
              key={album.id}
              className="relative group cursor-pointer bg-transparent border-none shadow-none"
              onClick={() => navigate(`/album/${album.id}`)}
            >
              {/* Folder shape only, no photo tab */}
              <div className="w-32 h-24 bg-white rounded-b-2xl rounded-t-lg shadow-lg border border-gray-200 flex flex-col justify-end items-center pt-10 pb-2 px-2 relative">
                {/* Optional: Add a subtle folder tab effect */}
                <div className="absolute -top-3 left-6 w-20 h-4 bg-gray-100 rounded-t-md shadow-sm border border-gray-200" />
                <span className="font-semibold text-sm text-gray-800 truncate w-full text-center mt-6 z-10" title={album.name}>{album.name}</span>
              </div>
              {/* Delete button (hover) */}
              <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={e => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                  disabled={deletingId === album.id}
                  className="shadow"
                >
                  {deletingId === album.id ? <Spinner size="sm" /> : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate("/uploadFile")}>Go to Uploads</Button>
      </div>
    </div>
  );
}
