import { useState } from "react";
import { register } from "./AuthService";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await register(email, password);
      setMessage(res.data.message);
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data || "Registration Failed");
      setOpen(true);
      setTimeout(() => setOpen(false), 2000);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border p-2 mb-2 w-full"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="border p-2 mb-2 w-full"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleRegister}>
        Register
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <p className="text-center text-lg font-semibold">
            {message === "Registration successful" || message === "User registered successfully" ?
              "Registration successful! Redirecting to login..." :
              message}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
