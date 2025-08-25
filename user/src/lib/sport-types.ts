// Sport type mapping theo backend API (matching maps page structure)
export const SPORT_TYPE_MAP: { [key: number]: string } = {
  101: "Sân cầu lông",
  102: "Sân bóng đá",
  103: "Sân pickleball",
  104: "Sân tennis",
  105: "Sân bóng chuyền",
  106: "Sân bóng rổ",
  107: "Sân golf",
  108: "Sân bóng bàn",
};

// Distance options for max distance filter (in meters)
export const DISTANCE_OPTIONS = [
  { value: 1000, label: "1 km" },
  { value: 2000, label: "2 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 20000, label: "20 km" },
  { value: 50000, label: "50 km" },
];

// Get all sport type options for select component
export const getSportTypeOptions = () => {
  return Object.entries(SPORT_TYPE_MAP).map(([id, name]) => ({
    value: parseInt(id),
    label: name,
  }));
};

// Get sport type name by ID
export const getSportTypeName = (id: number): string => {
  return SPORT_TYPE_MAP[id] || "Unknown";
};
