import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar({ search, setSearch }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-6">
        <span
          className="font-bold text-lg tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          s3-FileHub
        </span>
        <div className="flex gap-3 text-sm">
          <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
          <Button variant="ghost" onClick={() => navigate("/uploadFile")}>Upload</Button>
          <Button variant="ghost" onClick={() => navigate("/albums")}>Album</Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search your files..."
          className="w-64 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {token ? (
          <div className="relative">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
        )}
      </div>
    </nav>
  );
}
