import { AllAppliances } from "@/types/type";

export function convertToHoursMinutes(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours} H ${minutes} M`;
}

export function processAppliances(data: AllAppliances) {
  const parseNumbers = (arr: string[]) => arr.map(Number);

  // Parse numeric values
  const energyConsumption = parseNumbers(data["Energy Consumption (kWh)"]);
  const durationHours = parseNumbers(data["Duration (Hours)"]);
//   const powerRating = parseNumbers(data["Power Rating (Watt)"]);
//   const cost = parseNumbers(data["Cost (IDR)"]);

  // Jumlah total konsumsi energi
  const totalEnergyConsumption = energyConsumption.reduce(
    (sum, val) => sum + val,
    0
  );

  // Rata-rata konsumsi energi
  const averageEnergyConsumption =
    totalEnergyConsumption / energyConsumption.length;

  // Jumlah perangkat yang terhubung (Connected)
  const connectedDevicesCount = data["Connectivity Status"].filter(
    (status) => status === "Connected"
  ).length;

  // Perangkat dengan konsumsi energi tertinggi
  const maxEnergyIndex = energyConsumption.indexOf(
    Math.max(...energyConsumption)
  );
  const maxEnergyDevice = {
    "Device Name": data["Device Name"][maxEnergyIndex],
    "Device Type": data["Device Type"][maxEnergyIndex],
    "Energy Consumption (kWh)": energyConsumption[maxEnergyIndex],
  };

  // Durasi pemakaian perangkat terlama
  const maxDurationIndex = durationHours.indexOf(Math.max(...durationHours));
  const maxDurationDevice = {
    "Device Name": data["Device Name"][maxDurationIndex],
    "Device Type": data["Device Type"][maxEnergyIndex],
    "Duration (Hours)": durationHours[maxDurationIndex],
  };

  // Rincian perangkat di lokasi tertentu
  const getDevicesByLocation = (location: string) => {
    const indices = data.Location.map((loc, i) =>
      loc === location ? i : -1
    ).filter((i) => i !== -1);
    return indices.map((i) => ({
      "Device Name": data["Device Name"][i],
      Location: data.Location[i],
      "Energy Consumption (kWh)": energyConsumption[i],
      "Duration (Hours)": durationHours[i],
    }));
  };

//   Rata-rata konsumsi energi per jenis perangkat
  const averageEnergyByType = () => {
    const typeMap: { [key: string]: { total: number; count: number } } = {};
    data["Device Type"].forEach((type, i) => {
      if (!typeMap[type]) typeMap[type] = { total: 0, count: 0 };
      typeMap[type].total += energyConsumption[i];
      typeMap[type].count += 1;
    });
    const averages: { [key: string]: number } = {};
    for (const [type, { total, count }] of Object.entries(typeMap)) {
      averages[type] = total / count;
    }
    return averages;
  };

  return {
    totalEnergyConsumption,
    averageEnergyConsumption,
    connectedDevicesCount,
    maxEnergyDevice,
    maxDurationDevice,
    getDevicesByLocation,
    averageEnergyByType: averageEnergyByType(),
  };
}
