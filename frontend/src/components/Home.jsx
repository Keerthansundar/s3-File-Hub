import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <header className="w-full max-w-5xl mx-auto flex flex-col items-center py-12">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-2 text-gray-900 drop-shadow-lg">
            Keep your memories{" "}
            <span role="img" aria-label="eyes">
              👀
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            safe and easily{" "}
            <span className="inline-block align-middle">✌️</span> accessible
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button className="px-8 py-3 text-lg font-semibold bg-black text-white hover:bg-gray-800" onClick={() => navigate("/uploadFile")}>
            Share Memories →
          </Button>
        </div>
        <br></br>
        {/* Infinite carousel for tags */}
        <div className="overflow-hidden w-full max-w-3xl mx-auto mb-8">
          <div className="whitespace-nowrap animate-marquee flex gap-4">
            {Array(2).fill([
              "Weddings", "Christmas", "Birthdays", "Bachelor parties", "New Years", "Corporate events", "Graduations", "Halloween"
            ]).flat().map((tag, i) => (
              <span
                key={tag + i}
                className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium inline-block mx-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <main className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-4 pb-12">
        {/* Example gallery images */}
        <img src="/photo2.jpg" alt="Gallery 1" className="rounded-xl object-cover h-40 w-full shadow-md" />
        <img src="/photo3.jpg" alt="Gallery 2" className="rounded-xl object-cover h-40 w-full shadow-md" />
        <img src="/photo4.jpg" alt="Gallery 3" className="rounded-xl object-cover h-40 w-full shadow-md" />
        <img src="/photos1.jpg" alt="Gallery 4" className="rounded-xl object-cover h-40 w-full shadow-md" />
      </main>
      <footer className="w-full text-center text-xs text-gray-400 py-4 border-t mt-8">
        &copy; {new Date().getFullYear()} s3-FileHub. All rights reserved.
      </footer>
    </div>
  );
}
