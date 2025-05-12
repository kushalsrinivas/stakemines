import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Leaderboard from "./Leaderboard";

// Define cell type
type Cell = {
  revealed: boolean;
  type: "diamond" | "bomb";
};

// Constants
const GRID_SIZE = 5;
const BOMB_COUNT = 6;
const CELL_SIZE = Dimensions.get("window").width / (GRID_SIZE + 1);
const HIGH_SCORE_KEY = "@minestake_high_score";

const MineStake: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  const [revealedDiamonds, setRevealedDiamonds] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for new high score
  useEffect(() => {
    if (isNewHighScore) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat the animation a few times
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [isNewHighScore, pulseAnim]);

  // Load high score from AsyncStorage
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedHighScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (storedHighScore !== null) {
          setHighScore(Number.parseInt(storedHighScore, 10));
        }
      } catch (error) {
        console.error("Failed to load high score:", error);
      }
    };

    loadHighScore();
  }, []);

  // Save high score to AsyncStorage
  const updateHighScore = useCallback(
    async (newScore: number) => {
      if (newScore > highScore) {
        try {
          await AsyncStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
          setHighScore(newScore);
          setIsNewHighScore(true);
        } catch (error) {
          console.error("Failed to save high score:", error);
        }
      }
    },
    [highScore]
  );

  // Handle showing leaderboard
  const showLeaderboard = () => {
    setLeaderboardVisible(true);
  };

  // Hide leaderboard
  const hideLeaderboard = () => {
    setLeaderboardVisible(false);
  };

  // Initialize the game
  const initializeGame = useCallback(() => {
    // Create empty grid
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            revealed: false,
            type: "diamond",
          }))
      );

    // Place bombs randomly
    let bombsPlaced = 0;
    while (bombsPlaced < BOMB_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (newGrid[row][col].type !== "bomb") {
        newGrid[row][col].type = "bomb";
        bombsPlaced++;
      }
    }

    // Calculate total diamonds
    const diamonds = GRID_SIZE * GRID_SIZE - BOMB_COUNT;

    // Reset game state
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setTotalDiamonds(diamonds);
    setRevealedDiamonds(0);
    setIsNewHighScore(false);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle cell tap
  const handleCellPress = (row: number, col: number) => {
    // Ignore tap if game over or cell already revealed
    if (gameOver || gameWon || grid[row][col].revealed) {
      return;
    }

    // Create a copy of the grid
    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      revealed: true,
    };

    // Update the grid
    setGrid(newGrid);

    // Check cell type
    if (newGrid[row][col].type === "bomb") {
      // Game over if bomb
      setGameOver(true);
      // Update high score when game ends
      updateHighScore(score);
    } else {
      // Update score if diamond
      const newScore = score + 1;
      setScore(newScore);
      setRevealedDiamonds((prev) => prev + 1);

      // Check if all diamonds are revealed
      if (revealedDiamonds + 1 === totalDiamonds) {
        setGameWon(true);
        // Update high score when game is won
        updateHighScore(newScore);
      }
    }
  };

  // Render a cell
  const renderCell = (cell: Cell, row: number, col: number) => {
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          cell.revealed && cell.type === "bomb" && styles.bombCell,
          cell.revealed && cell.type === "diamond" && styles.diamondCell,
        ]}
        onPress={() => handleCellPress(row, col)}
        disabled={gameOver || gameWon || cell.revealed}
      >
        {cell.revealed && (
          <Text style={styles.cellContent}>
            {cell.type === "diamond" ? (
              <Ionicons name="diamond" size={24} color="#1e90ff" />
            ) : (
              <Ionicons name="bomb" size={24} color="#ff0000" />
            )}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MineStake</Text>
        <Text style={styles.score}>
          Score: {score} / {totalDiamonds}
        </Text>
        <TouchableOpacity onPress={showLeaderboard}>
          <Animated.Text
            style={[
              styles.highScore,
              isNewHighScore && {
                transform: [{ scale: pulseAnim }],
                color: "#FF0000",
              },
            ]}
          >
            {isNewHighScore ? "🏆 New High Score: " : "High Score: "}
            {highScore}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {(gameOver || gameWon) && (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            {gameWon ? "🎉 You Win! 🎉" : "💥 Game Over 💥"}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={initializeGame}>
          <Text style={styles.buttonText}>Restart Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.leaderboardButton]}
          onPress={showLeaderboard}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Modal */}
      <Leaderboard
        visible={leaderboardVisible}
        onClose={hideLeaderboard}
        currentScore={gameOver || gameWon ? score : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  highScore: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B00",
  },
  grid: {
    flexDirection: "column",
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 8,
  },
  bombCell: {
    backgroundColor: "#ffcccc",
  },
  diamondCell: {
    backgroundColor: "#ccffcc",
  },
  cellContent: {
    fontSize: 20,
  },
  messageContainer: {
    position: "absolute",
    top: "40%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    zIndex: 10,
  },
  message: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  leaderboardButton: {
    backgroundColor: "#FF6B00",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MineStake;
