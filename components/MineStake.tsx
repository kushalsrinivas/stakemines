import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define cell type
type Cell = {
  revealed: boolean;
  type: "diamond" | "bomb";
};

// Constants
const GRID_SIZE = 5;
const BOMB_COUNT = 6;
const CELL_SIZE = Dimensions.get("window").width / (GRID_SIZE + 1);

const MineStake: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  const [revealedDiamonds, setRevealedDiamonds] = useState(0);

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
    } else {
      // Update score if diamond
      setScore((prev) => prev + 1);
      setRevealedDiamonds((prev) => prev + 1);

      // Check if all diamonds are revealed
      if (revealedDiamonds + 1 === totalDiamonds) {
        setGameWon(true);
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

      <TouchableOpacity style={styles.button} onPress={initializeGame}>
        <Text style={styles.buttonText}>Restart Game</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MineStake;
