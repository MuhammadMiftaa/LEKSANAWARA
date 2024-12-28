"use client";
import { BackgroundGradientAnimation } from "../ui/background-gradient-animation";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../../types/type";
import { getBackendURL, getMode } from "@/lib/readenv";

export default function Upload() {
  const backendURL =
    getMode() === "production" ? getBackendURL() : "http://localhost:8080";

  const handleLogout = (): void => {
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    window.location.href = "/login";
  };

  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = async (files: File[]) => {
    setFiles(files);

    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("file", files[0]); // Mengambil file pertama dari array
    formData.append("upload_preset", "appliances_csv"); // Ganti dengan nama preset Anda

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dblibr1t2/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const { url } = data;

      const readFile = await fetch(`${backendURL}/v1/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!readFile.ok)
        throw new Error(`HTTP error! status: ${readFile.status}`);
      console.log(formData);

      console.log("Upload successful:", { files, data });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const [payload, setPayload] = useState<JwtPayload>({
    email: "",
    username: "",
    premium: false,
  });

  function decodeJwt(token: string): JwtPayload | null {
    try {
      const decoded = jwtDecode(token);
      return decoded as JwtPayload;
    } catch (error) {
      console.error("Invalid JWT token:", error);
      return null;
    }
  }

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setPayload(payload);
      }
    }
  }, []);

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(30, 60, 90)"
      gradientBackgroundEnd="rgb(10, 20, 50)"
      firstColor="50, 130, 160"
      secondColor="20, 40, 70"
      thirdColor="40, 100, 140"
      fourthColor="80, 150, 200"
      fifthColor="100, 200, 240"
      pointerColor="200, 250, 255"
      size="100%"
      blendingValue="overlay"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-evenly text-white font-bold px-4 text-3xl text-center md:text-4xl font-poppins">
        <p className="z-50 py-3 bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
          Hi, {payload?.username}
        </p>
        <div className="w-full max-w-4xl mx-auto bg-transparent rounded-lg font-poppins z-[9999]">
          <FileUpload onChange={handleFileUpload} />
        </div>
        <div className="w-64 h-10 rounded-full bg-white flex items-center justify-center gap-3">
          <img src="/logo.webp" alt="logo" className="w-8 h-8 rounded" />
          <h1 className="font-poppins text-xl italic font-semibold text-transparent bg-clip-text bg-gradient-to-l from-black to-neutral-400 w-fit">
            Leksanawara
          </h1>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={handleLogout}
              className="z-50 font-light uppercase absolute bottom-2 right-4 text-base text-zinc-200 hover:underline"
            >
              Logout
            </TooltipTrigger>
            <TooltipContent>
              <p>Log out of your account securely</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="hidden">{files.length}</div>
    </BackgroundGradientAnimation>
  );
}
