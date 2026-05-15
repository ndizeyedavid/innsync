export interface MealPlans {
  id: number;
  title: string;
  description: string;
  alt: string;
}

export const mealPlans: MealPlans[] = [
  {
    id: 0,
    title: "Room only",
    description: "No meals included",
    alt: "Included",
  },
  {
    id: 1,
    title: "Breakfast",
    description: "Daily buffet breakfast",
    alt: "+$28/night",
  },
];
