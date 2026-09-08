import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { recipes } from "@/data/mockRecipes";
import { getIngredientById } from "@/data/ingredients";
import { usePantry } from "@/context/PantryContext";
import { colors, IngredientChip, PrimaryButton, SectionHeader, SuggestionChip } from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";

const suggestions = ["High protein", "Quick meal", "Healthy", "Comfort food", "Under 20 min"];

export default function Home() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const { pantry } = usePantry(); const [query, setQuery] = useState("");
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled"><View style={styles.top}><View><Text style={styles.greeting}>Good evening</Text><Text style={styles.heading}>What should we cook?</Text></View><View style={styles.avatar}><Text>○</Text></View></View><SectionHeader action={<Pressable onPress={() => router.push("/(tabs)/pantry")}><Text style={styles.link}>View all</Text></Pressable>}>Your Kitchen</SectionHeader><View style={styles.chips}>{pantry.slice(0, 5).map(item => { const ingredient = getIngredientById(item.ingredientId); return ingredient ? <IngredientChip key={item.id} label={ingredient.name}/> : null; })}<Pressable onPress={() => router.push({ pathname:"/(tabs)/pantry", params:{ add:"1" } })} style={styles.addChip}><Text>+ Add ingredients</Text></Pressable></View><View style={styles.mood}><Text style={styles.label}>What are you in the mood for?</Text><TextInput multiline value={query} onChangeText={setQuery} placeholder="High-protein dinner under 30 minutes" placeholderTextColor={colors.textSecondary} style={styles.input}/><View style={styles.chips}>{suggestions.map(suggestion => <SuggestionChip key={suggestion} label={suggestion} selected={query === suggestion} onPress={() => setQuery(suggestion)}/>)}</View></View><PrimaryButton label="Find meals" onPress={() => router.push("/recipes")}/><SectionHeader>Cook with what I have</SectionHeader><View style={styles.cards}>{recipes.slice(0, 2).map(recipe => <RecipeCard key={recipe.id} recipe={recipe} compact onPress={() => router.push(`/recipes/${recipe.id}`)}/>)}</View></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ page:{flex:1,backgroundColor:"white"}, content:{paddingHorizontal:20,paddingBottom:28,gap:24}, top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}, greeting:{fontSize:15,color:colors.textSecondary}, heading:{fontSize:28,fontWeight:"700",color:colors.textPrimary,marginTop:4}, avatar:{width:40,height:40,borderRadius:20,backgroundColor:colors.placeholder,alignItems:"center",justifyContent:"center"}, link:{fontSize:14,fontWeight:"600",color:colors.textPrimary}, chips:{flexDirection:"row",flexWrap:"wrap",gap:8}, addChip:{paddingHorizontal:12,paddingVertical:9,justifyContent:"center"}, mood:{gap:12}, label:{fontSize:17,fontWeight:"700",color:colors.textPrimary}, input:{minHeight:96,borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,textAlignVertical:"top",fontSize:16,color:colors.textPrimary}, cards:{gap:12} });
