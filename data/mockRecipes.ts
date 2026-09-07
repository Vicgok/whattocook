import { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    id: "chicken-egg-rice-bowl",
    title: "Chicken Egg Rice Bowl",
    timeMinutes: 25,
    difficulty: "Easy",
    calories: 420,
    protein: 42,
    ingredientMatch: { owned: 7, total: 8 },
    ingredients: [
      { name: "Chicken", status: "owned" },
      { name: "Rice", status: "owned" },
      { name: "Tomato", status: "owned" },
      { name: "Onion", status: "owned" },
      { name: "Egg", status: "owned" },
      { name: "Greek yogurt", status: "missing" },
      { name: "Coriander", status: "optional" },
    ],
    steps: [
      {
        title: "Prepare the rice",
        description: "Warm the cooked rice and set it aside.",
        durationMinutes: 3,
      },
      {
        title: "Dice the onion and tomato",
        description: "Cut into small, even pieces.",
        durationMinutes: 2,
      },
      {
        title: "Cook the chicken",
        description: "Cook chicken in a hot pan until browned.",
        durationMinutes: 8,
      },
      {
        title: "Scramble the egg",
        description: "Push chicken aside and softly scramble the egg.",
        durationMinutes: 3,
      },
      {
        title: "Combine everything",
        description: "Add rice, tomato and onion, then toss well.",
        durationMinutes: 5,
      },
      {
        title: "Serve the bowl",
        description: "Finish with yogurt and optional coriander.",
        durationMinutes: 4,
      },
    ],
  },
  {
    id: "spicy-chicken-fried-rice",
    title: "Spicy Chicken Fried Rice",
    timeMinutes: 20,
    difficulty: "Medium",
    calories: 480,
    protein: 39,
    ingredientMatch: { owned: 6, total: 8 },
    ingredients: [
      { name: "Chicken", status: "owned" },
      { name: "Rice", status: "owned" },
      { name: "Onion", status: "owned" },
      { name: "Eggs", status: "owned" },
      { name: "Capsicum", status: "owned" },
      { name: "Soy sauce", status: "missing" },
      { name: "Chilli flakes", status: "optional" },
    ],
    steps: [
      {
        title: "Prep vegetables",
        description: "Dice the onion and capsicum.",
        durationMinutes: 3,
      },
      {
        title: "Sear chicken",
        description: "Cook chicken until browned.",
        durationMinutes: 7,
      },
      {
        title: "Fry rice",
        description: "Toss rice with vegetables and seasoning.",
        durationMinutes: 6,
      },
      {
        title: "Finish",
        description: "Fold in egg and serve hot.",
        durationMinutes: 4,
      },
    ],
  },
  {
    id: "quick-egg-chicken-bowl",
    title: "Quick Egg & Chicken Bowl",
    timeMinutes: 18,
    difficulty: "Easy",
    calories: 390,
    protein: 37,
    ingredientMatch: { owned: 5, total: 7 },
    ingredients: [
      { name: "Chicken", status: "owned" },
      { name: "Eggs", status: "owned" },
      { name: "Rice", status: "owned" },
      { name: "Tomato", status: "owned" },
      { name: "Onion", status: "owned" },
      { name: "Spinach", status: "missing" },
    ],
    steps: [
      {
        title: "Prepare ingredients",
        description: "Chop vegetables and warm the rice.",
        durationMinutes: 3,
      },
      {
        title: "Cook chicken",
        description: "Pan cook chicken until done.",
        durationMinutes: 8,
      },
      {
        title: "Add eggs",
        description: "Scramble eggs in the same pan.",
        durationMinutes: 3,
      },
      {
        title: "Assemble",
        description: "Layer all ingredients in a bowl.",
        durationMinutes: 4,
      },
    ],
  },
];
export const recipeById = (id?: string) =>
  recipes.find((recipe) => recipe.id === id) ?? recipes[0];
