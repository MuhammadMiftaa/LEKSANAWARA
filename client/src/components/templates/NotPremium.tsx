import { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import { JwtPayload } from "@/types/type";
import { jwtDecode } from "jwt-decode";

export default function NotPremium() {
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

  const [openModal, setOpenModal] = useState(false);

  async function handleSetPremium() {
    try {
      const response = await fetch(
        "http://localhost:8080/v1/users/set-premium",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: payload?.email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status) {
        alert("Upgrade to premium success!");
        document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        window.location.href = "/login";
      } else {
        alert("Upgrade to premium failed!");
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      alert("Upgrade to premium failed!");
    }
  }
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <h1 className="font-bold text-xl">
        Oops! This feature is exclusive to Premium members.
      </h1>
      <h2 className="text-sm font-light">
        Upgrade to Premium to unlock this feature and enjoy advanced tools like
        Smart Scheduling and Daily Energy Monitoring.
      </h2>
      <button
        onClick={() => setOpenModal(true)}
        className="cursor-pointer p-0.5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl overflow-hidden my-4  shadow-medium hover:shadow-strong duration-300 shadow-black hover:shadow-black"
      >
        <h1 className="cursor-pointer py-2 px-5 bg-gradient-to-r from-zinc-700 uppercase font-inter via-black to-zinc-800 text-orange-300 rounded-2xl text-lg ">
          Upgrade to Premium
        </h1>
      </button>
      <img className="h-64 -mt-10" src="/characters/3.png" alt="" />
      <PricingCard
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleSetPremium={handleSetPremium}
      />
    </div>
  );
}
