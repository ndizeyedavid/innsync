export interface FloorPreference {
  label: string;
  value: string;
}

export const floorPreference: FloorPreference[] = [
  { label: "Top Floor", value: "top" },
  { label: "High Floor", value: "high" },
  { label: "Lower Floor", value: "lower" },
  { label: "End of Corridor", value: "end" },
];
