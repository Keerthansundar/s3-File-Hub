import { useState } from "react";
import { login } from "./AuthService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.token);
      setMessage(res.data.message || "Login Successful");
      setOpen(true);
      setTimeout(() => navigate("/uploadFile"), 1000);
    } catch (err) {
      setMessage(err.response?.data || "Login Failed");
      setOpen(true);
      setTimeout(() => setOpen(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2"
      />
      <Button className="w-full" onClick={handleLogin}>
        Login
      </Button>
      <div className="text-center text-sm mt-2">
        Not registered?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline"
        >
          Sign up
        </Link>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <p className="text-center text-lg font-semibold text-red-500">
            {message}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
