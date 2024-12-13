"use client";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Recommendations } from "@/types/type";

export default function Analytics() {
  const golonganListrik = [
    "Subsidi daya 450 VA",
    "Subsidi daya 900 VA",
    "R-1/TR daya 900 VA",
    "R-1/TR daya 1300 VA",
    "R-1/TR daya 2200 VA",
    "R-2/TR daya 3500 VA - 5500 VA",
    "R-3/TR daya 6600 VA ke atas",
    "B-2/TR daya 6600 VA - 200 kVA",
    "B-3/TM daya di atas 200 kVA",
    "I-3/TM daya di atas 200 kVA",
    "I-4/TT daya 30.000 kVA ke atas",
    "P-1/TR daya 6600 VA - 200 kVA",
    "P-2/TM daya di atas 200 kVA",
    "P-3/TR penerangan jalan umum",
    "L/TR",
    "L/TM",
    "L/TT",
  ];

  const [targetCost, setTargetCost] = useState(48048);
  const [recommendations, setRecommendations] = useState<Recommendations>({
    message: "a",
    recommendations: [],
  });

  function onClick(adjustment: number) {
    if (targetCost === 48048) setTargetCost(40000 + adjustment);
    else setTargetCost(targetCost + adjustment);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Mencegah reload halaman

    const formData = new FormData(event.currentTarget);
    const electricType = formData.get("ElectricityTier")?.toString();
    const targetCost = parseInt(
      formData.get("targetCost")?.toString() || "0",
      10
    );

    if (!electricType || !targetCost) {
      alert("Please select an electricity tier and set a valid target cost.");
      return;
    }

    // Hitung bulan berikutnya
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const formattedNextMonth = nextMonth.toISOString().split("T")[0];

    const payload = {
      golongan: electricType,
      maks_biaya: targetCost,
      tanggal: formattedNextMonth,
    };

    try {
      const response = await fetch(
        "http://localhost:8080/v1/generate-monthly-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recommendations.");
      }

      const data = await response.json();
      setRecommendations({
        message: data.data[0],
        recommendations: data.data.slice(1),
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate recommendations.");
    }
  }

  return (
    <div className="flex w-full h-full p-4 gap-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-lightGray to-teal-300 w-full h-full basis-1/3 rounded-3xl flex flex-col items-center justify-between py-8 px-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Set Your Target Cost
          </h1>
          <p className="text-slate-700 text-center text-sm">
            Define the maximum amount you want to spend on electricity this
            month.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <h1>Electricity Tier</h1>
          <select
            id="ElectricityTier"
            name="ElectricityTier"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            required
          >
            <option value="" disabled selected>
              Select Your Electricity Tier
            </option>
            {golonganListrik.map((golongan) => (
              <option key={golongan} value={golongan}>
                {golongan}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="-mb-2">Set Your Target Cost</h1>
          <div className="px-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-10000)}
                disabled={targetCost <= 1000}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <input
                  name="targetCost"
                  type="number"
                  value={targetCost}
                  onChange={(e) => {
                    const newTargetCost = Math.max(
                      1000,
                      Math.min(10000000, parseInt(e.target.value) || 0)
                    );
                    setTargetCost(newTargetCost);
                  }}
                  className="w-full text-7xl font-bold tracking-tighter bg-transparent border-none focus:outline-none text-center"
                />
                <div className="text-[0.70rem] uppercase text-muted-foreground -mt-5">
                  IDR/Month
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(10000)}
                disabled={targetCost >= 10000000}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
        </div>
        <Button type="submit" className="px-10 text-teal-400">
          Generate
        </Button>
      </form>
      <div className="bg-gradient-to-br from-lightGray to-teal-300 w-full h-full basis-2/3 rounded-3xl">
        {recommendations.message ? (
          <div className="h-full w-full p-5">
            <h1 className="text-2xl font-bold text-center">Your Appliance Schedule Summary</h1>
          </div>
        ) : (
          <InitComponent />
        )}
      </div>
    </div>
  );
}

import React from "react";

function InitComponent() {
  return (
    <div className="h-full w-full flex flex-col justify-between p-10 items-center">
      <h1 className="text-3xl font-bold">Let’s Set Your Energy Target!</h1>
      <img className="h-64 my-4" src="/characters/4.png" alt="" />
      <p className="text-center text-zinc-800">
        Start by setting your electricity tier and target cost on the left.{" "}
      </p>
    </div>
  );
}
