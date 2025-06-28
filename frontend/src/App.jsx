import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Home from "@/components/Home";
import UploadFile from "@/components/UploadFile";
import AlbumsList from "@/components/AlbumsList";
import AlbumDetails from "@/components/AlbumDetails";
import SharedAlbum from "@/components/SharedAlbum";
import Register from "@/components/Register";
import Login from "@/components/Login";
import EmailVerification from "@/components/EmailVerification";
import "./App.css";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppRoutes({ search, setSearch }) {
  return (
    <>
      <Navbar search={search} setSearch={setSearch} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/uploadFile" element={<RequireAuth><UploadFile search={search} setSearch={setSearch} /></RequireAuth>} />
        <Route path="/albums" element={<RequireAuth><AlbumsList /></RequireAuth>} />
        <Route path="/album/:id" element={<RequireAuth><AlbumDetails /></RequireAuth>} />
        <Route path="/shared/:shareCode" element={<SharedAlbum />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  const [search, setSearch] = useState("");
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes search={search} setSearch={setSearch} />
      </div>
    </BrowserRouter>
  );
}

export default App;
