import { AllAppliances, Appliance } from "@/types/type";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { convertToHoursMinutes, processAppliances } from "@/helper/function";
// import * as moment from "moment-duration-format";

export default function RoomsTabs() {
  // GET request to fetch table data🐳
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
      console.log(data.data);
    }
  }, [data]);
  // GET request to fetch table data🐳

  // GET request to fetch all appliances data🐳
  const [allAppliances, setAllAppliances] = useState<AllAppliances>({
    "Connectivity Status": [],
    "Cost (IDR)": [],
    "Device ID": [],
    "Device Name": [],
    "Device Type": [],
    "Duration (Hours)": [],
    "Energy Consumption (kWh)": [],
    Location: [],
    "Power Rating (Watt)": [],
    "Status (ON/OFF)": [],
    "Usage End Time": [],
    "Usage Start Time": [],
  });

  const [analysisResult, setAnalysisResult] = useState({
    totalEnergyConsumption: 0,
    averageEnergyConsumption: 0,
    connectedDevicesCount: 0,
    maxEnergyDevice: { "Energy Consumption (kWh)": 0 },
    maxDurationDevice: { "Duration (Hours)": 0 },
  });
  const allAppliancesFetcher = (url: string, init: RequestInit | undefined) =>
    fetch(url, init).then((res) => res.json());
  const { data: alldata } = useSWR(
    "http://localhost:8080/v1/all-appliances",
    (url) =>
      allAppliancesFetcher(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
  );

  useEffect(() => {
    if (alldata?.status) {
      setAllAppliances(alldata.data);

      const {
        totalEnergyConsumption,
        averageEnergyConsumption,
        connectedDevicesCount,
        maxEnergyDevice,
        maxDurationDevice,
      } = processAppliances(alldata.data);

      setAnalysisResult({
        totalEnergyConsumption,
        averageEnergyConsumption,
        connectedDevicesCount,
        maxEnergyDevice,
        maxDurationDevice,
      });

      console.log(alldata.data);
      console.log(analysisResult);
    }
  }, [alldata]);
  // GET request to fetch all appliances data🐳

  return (
    <div className="w-full overflow-hidden relative h-full">
      <div className="flex gap-6">
        <Carousel
          orientation="horizontal"
          className="w-[30rem] h-56 m-4 rounded-3xl bg-gradient-to-br from-gradientStart to-gradientEnd py-2 px-4"
        >
          <CarouselContent className="rounded-3xl">
            {appliance.map((app, index) => (
              <CarouselItem className="flex items-center gap-5" key={index}>
                <img
                  className="w-1/3 h-full object-contain"
                  src={`/appliance/${app.type}.png`}
                  alt=""
                />
                <div className="flex flex-col justify-center w-full">
                  <div className="mt-2 mb-4 flex justify-between items-center">
                    <div className="basis-2/3">
                      <h2 className="text-zinc-300 text-[0.7rem] font-light -mb-1">
                        Device
                      </h2>
                      <h1 className="text-white text-xl font-semibold line-clamp-1">
                        {app.name}
                      </h1>
                    </div>
                    <h1 className="basis-1/3 text-tealBright font-bold text-2xl">
                      {app.power}{" "}
                      <span className="text-xs font-light -ml-1">Watt</span>
                    </h1>
                  </div>
                  <div className="rounded-xl px-3 py-3 flex justify-between w-full bg-teal-300">
                    <div className="basis-1/2 flex flex-col items-center border-r border-black">
                      <h1 className="text-center">
                        {convertToHoursMinutes(app.usage_today)}
                      </h1>
                      <p className="text-center text-[0.6rem]">Time Usage</p>
                    </div>
                    <div className="basis-1/2 flex flex-col items-center">
                      <h2 className="text-center">{app.energy} W</h2>
                      <p className="text-center text-[0.6rem]">
                        Energy Consumption
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl mt-3 px-3 py-3 flex justify-between w-full bg-teal-300">
                    <h1 className="font-light text-zinc-800">Cost: </h1>
                    <h2 className="font-bold text-lg">IDR {app.cost}</h2>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
