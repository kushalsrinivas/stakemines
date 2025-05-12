import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define the structure of a score entry
type ScoreEntry = {
  score: number;
  date: string;
};

// Props for the Leaderboard component
interface LeaderboardProps {
  visible: boolean;
  onClose: () => void;
  currentScore?: number;
}

const LEADERBOARD_KEY = "@minestake_leaderboard";
const MAX_SCORES = 5; // Maximum number of scores to keep

const Leaderboard: React.FC<LeaderboardProps> = ({
  visible,
  onClose,
  currentScore,
}) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  // Load scores from AsyncStorage
  useEffect(() => {
    const loadScores = async () => {
      try {
        const savedScores = await AsyncStorage.getItem(LEADERBOARD_KEY);
        if (savedScores) {
          setScores(JSON.parse(savedScores));
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    };

    loadScores();
  }, []);

  // Add the current score to leaderboard if provided
  useEffect(() => {
    if (visible && currentScore !== undefined && currentScore > 0) {
      const addScore = async () => {
        try {
          // Create new score entry
          const newEntry: ScoreEntry = {
            score: currentScore,
            date: new Date().toLocaleDateString(),
          };

          // Get existing scores
          let updatedScores = [...scores, newEntry];

          // Sort by score (highest first)
          updatedScores.sort((a, b) => b.score - a.score);

          // Keep only top scores
          updatedScores = updatedScores.slice(0, MAX_SCORES);

          // Save to storage
          await AsyncStorage.setItem(
            LEADERBOARD_KEY,
            JSON.stringify(updatedScores)
          );

          // Update state
          setScores(updatedScores);
        } catch (error) {
          console.error("Failed to save score:", error);
        }
      };

      addScore();
    }
  }, [visible, currentScore, scores]);

  // Render a score item
  const renderScoreItem = ({
    item,
    index,
  }: {
    item: ScoreEntry;
    index: number;
  }) => (
    <View style={styles.scoreItem}>
      <View style={styles.ranking}>
        <Text style={styles.rankingText}>{index + 1}</Text>
      </View>
      <Text style={styles.scoreText}>{item.score}</Text>
      <Text style={styles.dateText}>{item.date}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Leaderboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {scores.length > 0 ? (
            <FlatList
              data={scores}
              renderItem={renderScoreItem}
              keyExtractor={(item) => `score-${item.score}-${item.date}`}
              contentContainerStyle={styles.scoresList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No scores yet. Play a game!</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  scoresList: {
    paddingBottom: 10,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ranking: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  rankingText: {
    color: "white",
    fontWeight: "bold",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    color: "#777",
    fontSize: 14,
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
});

export default Leaderboard;
