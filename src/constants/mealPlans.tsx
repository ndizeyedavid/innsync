export interface MealPlans {
  id: "room-only" | "breakfast" | "half-board" | "full-board";
  title: string;
  description: string;
  alt: string;
}

export const mealPlans: MealPlans[] = [
  {
    id: "room-only",
    title: "Room only",
    description: "No meals included",
    alt: "Included",
  },
  {
    id: "breakfast",
    title: "Breakfast",
    description: "Daily buffet breakfast",
    alt: "+$28/night",
  },
  {
    id: "half-board",
    title: "Half board",
    description: "Breakfast and dinner included",
    alt: "+$65/night",
  },
  {
    id: "full-board",
    title: "Full board",
    description: "Breakfast, lunch, and dinner included",
    alt: "+$95/night",
  },
];
