import {
  AllAppliances,
  Appliance,
  OverusedDevices,
} from "@/types/type";

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

type ChartData = {
  category: string;
  value: number;
  fill: string;
};

type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

export function transformDataToChartProps(data: Appliance[]): {
  chartData: ChartData[];
  chartConfig: ChartConfig;
} {
  // Generate warna untuk setiap perangkat berdasarkan panjang array
  const colors = generateColors(data.length);

  // Mengubah data ke dalam format chartData
  const chartData: ChartData[] = data.map((item, index) => ({
    category: item.name, // Misalnya: Mesin Cuci, Microwave
    value: parseFloat(item.average_usage.toFixed(1)), // Membatasi 1 angka di belakang koma
    fill: colors[index], // Warna berdasarkan index
  }));

  // Membuat chartConfig
  const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
    acc[item.type] = {
      label: item.name, // Nama perangkat
      color: colors[index], // Warna perangkat
    };
    return acc;
  }, {} as ChartConfig);

  return { chartData, chartConfig };
}

// Fungsi untuk menghasilkan warna cerah dan kontras tinggi
export function generateColors(length: number): string[] {
  const colors: string[] = [];
  const step = 360 / length; // Membagi warna secara merata dalam spektrum HSL

  for (let i = 0; i < length; i++) {
    const hue = Math.round(i * step); // Menentukan hue (warna utama)
    const saturation = 70 + Math.round((i % 3) * 10); // Saturasi: 70% hingga 90%
    const lightness = 50; // Kecerahan tetap di 50% untuk warna cerah
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

export function findOverusedDevices(
  allAppliances: AllAppliances,
  appliances: Appliance[]
): OverusedDevices[] {
  // Hasil perangkat yang melebihi average_usage
  const overusedDevices: OverusedDevices[] = [];

  // Loop melalui semua perangkat di AllAppliances
  allAppliances["Device Name"].forEach((deviceName, index) => {
    const deviceDurationStr = allAppliances["Duration (Hours)"][index];
    const deviceDuration = parseFloat(deviceDurationStr) || 0; // Konversi ke angka
    const matchedAppliance = appliances.find((a) => a.name === deviceName); // Cocokkan dengan Appliance

    if (matchedAppliance && deviceDuration > matchedAppliance.average_usage) {
      overusedDevices.push({
        name: deviceName,
        duration: deviceDuration,
        averageUsage: matchedAppliance.average_usage,
        usageStartTime: allAppliances["Usage Start Time"][index],
        usageEndTime: allAppliances["Usage End Time"][index],
      });
    }
  });

  return overusedDevices;
}

export function mapStringsToObjects(data: string[]) {
  return data.map((item) => {
    const nameMatch = item.match(/Name: ([^,]+)/);
    const typeMatch = item.match(/Type: ([^,]+)/);
    const priorityMatch = item.match(/Priority: (true|false)/);
    const monthlyUseMatch = item.match(/Monthly Use: ([\d\.]+) kWh/);
    const costMatch = item.match(/Cost: Rp([\d\.]+)/);
    const scheduleMatch = item.match(/Schedule: \[([^\]]*)\]/);

    return {
      name: nameMatch ? nameMatch[1] : null,
      type: typeMatch ? typeMatch[1] : null,
      priority: priorityMatch ? priorityMatch[1] === "true" : null,
      monthlyUse: monthlyUseMatch ? parseFloat(monthlyUseMatch[1]) : null,
      cost: costMatch ? parseFloat(costMatch[1]) : null,
      ctaText: "Detail",
      schedule: scheduleMatch
        ? scheduleMatch[1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
  });
}
