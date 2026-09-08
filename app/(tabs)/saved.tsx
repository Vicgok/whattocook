import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { PlaceholderImage, colors, TabScreenHeader } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { recipes } from "@/data/mockRecipes";
import { useApp } from "@/context/AppContext";

export default function Saved() {
  const router = useRouter(); const { savedRecipeIds, toggleSaved } = useApp(); const [search, setSearch] = useState("");
  const saved = useMemo(() => recipes.filter(recipe => savedRecipeIds.includes(recipe.id) && recipe.title.toLowerCase().includes(search.toLowerCase())), [savedRecipeIds, search]);
  return <View style={styles.page}><TabScreenHeader title="Saved Recipes" subtitle="Recipes you want to cook again" /><ScrollView contentContainerStyle={styles.content}>{savedRecipeIds.length > 0 && <TextInput value={search} onChangeText={setSearch} placeholder="Search saved recipes" placeholderTextColor={colors.textSecondary} style={styles.search} />}{savedRecipeIds.length === 0 ? <EmptyState title="No saved recipes yet" text="Save recipes you love and they’ll appear here." actionLabel="Find meals" onAction={() => router.push("/(tabs)")} /> : <View style={styles.cards}>{saved.map(recipe => <Pressable key={recipe.id} onPress={() => router.push(`/recipes/${recipe.id}`)} style={styles.card}><PlaceholderImage height={112}/><View style={styles.body}><View style={styles.row}><Text style={styles.cardTitle}>{recipe.title}</Text><Pressable hitSlop={8} onPress={() => toggleSaved(recipe.id)}><Text>♥</Text></Pressable></View><Text style={styles.meta}>{recipe.timeMinutes} min • {recipe.difficulty}</Text><Text style={styles.protein}>{recipe.protein}g protein</Text></View></Pressable>)}</View>}</ScrollView></View>;
}

const styles = StyleSheet.create({ page:{flex:1,backgroundColor:"white"},content:{paddingHorizontal:20,paddingBottom:32,gap:12},search:{height:50,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:12,fontSize:16,marginTop:6},cards:{gap:12,marginTop:6},card:{borderWidth:1,borderColor:colors.border,borderRadius:12,overflow:"hidden"},body:{padding:12,gap:5},row:{flexDirection:"row",justifyContent:"space-between",gap:8},cardTitle:{fontSize:17,fontWeight:"700",flex:1},meta:{fontSize:14,color:colors.textSecondary},protein:{fontSize:14,fontWeight:"600"} });
