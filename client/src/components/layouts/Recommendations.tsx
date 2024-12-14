import { cn } from "@/lib/utils";
import { Appliance } from "@/types/type";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Recommendations() {
  // GET request to fetch table data 🐳
  const [appliance, setAppliance] = useState<Appliance[]>([]);
  const applianceFetcher = (url: string, init: RequestInit | undefined) =>
    fetch(url, init).then((res) => res.json());
  const { data } = useSWR("http://localhost:8080/v1/appliance", (url) =>
    applianceFetcher(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );

  useEffect(() => {
    if (data?.status) {
      setAppliance(data.data);
      // Inisialisasi targetUsage berdasarkan appliance
      const initialUsage = data.data.map((app: Appliance) => ({
        id: app.id,
        target: 0, // Set default target usage (contoh: 10 jam)
      }));
      setTargetUsage(initialUsage);
    }
  }, [data]);

  // State untuk target usage per appliance
  const [targetUsage, setTargetUsage] = useState<
    { id: number, target: number }[]
  >([]);

  // Fungsi untuk mengubah target usage berdasarkan appliance name
  function updateTargetUsage(id: number, adjustment: number) {
    setTargetUsage((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, target: Math.max(0, item.target + adjustment) } // Minimal 0
          : item
      )
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-4 max-w-7xl mx-auto">
      {appliance.map((app, index) => (
        <div
          key={app.name}
          className={cn(
            "flex flex-col lg:border-r  pt-10 relative group/feature dark:border-neutral-800",
            (index === 0 || index === 4) &&
              "lg:border-l dark:border-neutral-800",
            index < 4 && "lg:border-b dark:border-neutral-800"
          )}
        >
          {index < 4 && (
            <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
          )}
          {index >= 4 && (
            <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
          )}
          <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
            <img
              className="h-12 w-12 object-contain"
              src={`/appliance/${app.type}.png`}
              alt=""
            />
          </div>
          <div className="text-lg font-bold mb-2 relative z-10 px-10">
            <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
            <div className="flex w-full flex-col">
              <div className="flex flex-col">
                <span className="group-hover/feature:translate-x-2 transition duration-200 text-base inline-block text-black dark:text-neutral-100">
                  {app.location}
                </span>
              </div>
              <h1 className="font-light -mt-1.5 text-nowrap overflow-scroll">
                {app.name} - {app.power} Watt
              </h1>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-6 w-6 shrink-0 rounded-full"
                onClick={() => updateTargetUsage(app.id, -1)} // Kurangi target usage
                disabled={
                  targetUsage.find((item) => item.id === app.id)?.target ===
                  0
                }
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <input
                  name={`target-${app.id}`}
                  type="number"
                  value={
                    targetUsage.find((item) => item.id === app.id)
                      ?.target || 0
                  }
                  onChange={(e) => {
                    const newTarget = Math.max(
                      0,
                      parseInt(e.target.value) || 0
                    ); // Minimal 0
                    setTargetUsage((prev) =>
                      prev.map((item) =>
                        item.id === app.id
                          ? { ...item, target: newTarget }
                          : item
                      )
                    );
                  }}
                  className="w-full text-2xl font-bold tracking-tighter bg-transparent border-none focus:outline-none text-center"
                />
                <div className="text-[0.60rem] font-medium uppercase text-muted-foreground -mt-5">
                  Hours/Day
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-6 w-6 shrink-0 rounded-full"
                onClick={() => updateTargetUsage(app.id, 1)} // Tambah target usage
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <div></div>
        </div>
      ))}
      <button type="button" onClick={() => console.log(targetUsage)} className="py-2.5 px-6 rounded-full bg-gradient-to-br hover:bg-gradient-to-br from-teal-300 hover:from-yellow-300 via-lightGray to-tealBright hover:to-orange-400 fixed shadow-strong shadow-white uppercase text-lg tracking-[.2rem] font-bold font-inter hover:shadow-orange-400 duration-500 cursor-pointer bottom-10 left-1/2 -translate-x-1/2">
        Generate Now
      </button>
    </div>
  );
}
