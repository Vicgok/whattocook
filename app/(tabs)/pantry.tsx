import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePantry } from "@/context/PantryContext";
import { colors, IngredientChip, IngredientRow, PrimaryButton, SectionHeader, SuggestionChip } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { searchIngredients } from "@/domain/ingredients/ingredient-search";

const suggestionIds = ["chicken", "egg", "tomato", "onion", "rice", "paneer", "potato", "bell-pepper"];

export default function Pantry() {
  const { pantry, addIngredients, removeIngredient } = usePantry();
  const { add } = useLocalSearchParams<{ add?: string }>();
  const [visible, setVisible] = useState(add === "1");
  const [search, setSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (ingredientId: string) => setSelected((old) => old.includes(ingredientId) ? old.filter((id) => id !== ingredientId) : [...old, ingredientId]);
  const shown = pantry.filter((item) => getIngredientById(item.ingredientId)?.name.toLowerCase().includes(search.toLowerCase()));
  const matchingIngredients = searchIngredients(ingredientSearch, ingredients).map((result) => result.ingredient);
  const suggestions = suggestionIds.map(getIngredientById).filter((ingredient): ingredient is NonNullable<typeof ingredient> => Boolean(ingredient));

  return <View style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Your Pantry</Text>
    <TextInput value={search} onChangeText={setSearch} placeholder="Search your pantry" style={styles.search}/>
    {pantry.length === 0 ? <EmptyState title="Your pantry is empty" text="Add what you have at home so WhatToCook can suggest better meals." actionLabel="Add ingredients" onAction={() => setVisible(true)}/> : <>
      <SectionHeader>Available ingredients</SectionHeader>
      {shown.map((item) => { const ingredient = getIngredientById(item.ingredientId); return ingredient ? <IngredientRow key={item.id} name={ingredient.name} status="Available" onRemove={() => removeIngredient(item.ingredientId)}/> : null; })}
      <PrimaryButton label="+ Add ingredient" onPress={() => setVisible(true)}/>
    </>}
  </ScrollView><Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}><View style={styles.overlay}><Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}/><View style={styles.sheet}>
    <Text style={styles.sheetTitle}>Add Ingredients</Text><Text style={styles.support}>Search and choose ingredients you have at home.</Text>
    <TextInput value={ingredientSearch} onChangeText={setIngredientSearch} placeholder="Search all ingredients" autoFocus style={styles.search}/>
    <View style={styles.chips}>{(ingredientSearch ? matchingIngredients : suggestions).map((ingredient) => <SuggestionChip key={ingredient.id} label={ingredient.name} selected={selected.includes(ingredient.id)} onPress={() => toggle(ingredient.id)}/>)}</View>
    {ingredientSearch && matchingIngredients.length === 0 && <Text style={styles.support}>No ingredients found.</Text>}
    {selected.length > 0 && <View style={styles.chips}>{selected.map((ingredientId) => { const ingredient = getIngredientById(ingredientId); return ingredient ? <IngredientChip key={ingredientId} label={ingredient.name} removable onPress={() => toggle(ingredientId)}/> : null; })}</View>}
    <PrimaryButton label={`Add ${selected.length || ""} ingredient${selected.length === 1 ? "" : "s"}`} disabled={!selected.length} onPress={() => { addIngredients(selected); setSelected([]); setIngredientSearch(""); setVisible(false); }}/>
  </View></View></Modal></View>;
}

const styles = StyleSheet.create({ page:{flex:1,backgroundColor:"white"}, content:{padding:20,paddingTop:58,paddingBottom:32,gap:16}, title:{fontSize:28,fontWeight:"700"}, search:{height:50,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:12,fontSize:16}, overlay:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,.25)"}, sheet:{backgroundColor:"white",borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,gap:14}, sheetTitle:{fontSize:22,fontWeight:"700"}, support:{color:colors.textSecondary}, chips:{flexDirection:"row",flexWrap:"wrap",gap:8} });
