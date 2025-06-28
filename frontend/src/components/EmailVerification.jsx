import { useState } from "react";
import { verifyEmail } from "./AuthService";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await verifyEmail(email);
      setMessage(res.data);
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        navigate("/");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data || "Verification Failed");
      setOpen(true);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Verify Email</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border p-2 mb-2 w-full"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="bg-purple-500 text-white px-4 py-2" onClick={handleVerify}>
        Verify Email
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <p className="text-center text-lg font-semibold">
            {message === "Verification successful" || message === "Email verified successfully" ?
              "Your email is verified! Redirecting to home..." :
              message}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
