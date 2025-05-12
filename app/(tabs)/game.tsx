import MineStake from "@/components/MineStake";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";

export default function GameScreen() {
  return (
    <ThemedView style={styles.container}>
      <MineStake />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
