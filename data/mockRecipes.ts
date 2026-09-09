import { Recipe } from "../types/recipe";

export const recipes: Recipe[] = [
  {
    id: "chicken-egg-rice-bowl",
    title: "Chicken Egg Rice Bowl",
    timeMinutes: 25,
    difficulty: "Easy",
    calories: 420,
    protein: 42,
    ingredients: [
      {
        id: "chicken-egg-rice-bowl-chicken",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "chicken",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-rice",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "rice",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-tomato",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "tomato",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-onion",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "onion",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-egg",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "egg",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-greek-yogurt",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "greek-yogurt",
        isOptional: false,
      },
      {
        id: "chicken-egg-rice-bowl-cilantro",
        recipeId: "chicken-egg-rice-bowl",
        ingredientId: "cilantro",
        isOptional: true,
      },
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
    ingredients: [
      {
        id: "spicy-chicken-fried-rice-chicken",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "chicken",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-rice",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "rice",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-onion",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "onion",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-egg",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "egg",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-bell-pepper",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "bell-pepper",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-soy-sauce",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "soy-sauce",
        isOptional: false,
      },
      {
        id: "spicy-chicken-fried-rice-red-pepper-flakes",
        recipeId: "spicy-chicken-fried-rice",
        ingredientId: "red-pepper-flakes",
        isOptional: true,
      },
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
    ingredients: [
      {
        id: "quick-egg-chicken-bowl-chicken",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "chicken",
        isOptional: false,
      },
      {
        id: "quick-egg-chicken-bowl-egg",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "egg",
        isOptional: false,
      },
      {
        id: "quick-egg-chicken-bowl-rice",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "rice",
        isOptional: false,
      },
      {
        id: "quick-egg-chicken-bowl-tomato",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "tomato",
        isOptional: false,
      },
      {
        id: "quick-egg-chicken-bowl-onion",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "onion",
        isOptional: false,
      },
      {
        id: "quick-egg-chicken-bowl-spinach",
        recipeId: "quick-egg-chicken-bowl",
        ingredientId: "spinach",
        isOptional: false,
      },
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
