import { Text } from "react-native-paper";
import { StyleSheet, View, Button, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { API_URL } from "../App";

export const HomeScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    }

    fetch(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${global.userToken}` },
    })
      .then(async (res) => {
        const json = await res.json();
        console.log(json);
        setCards(json.transactions);
      })
      .catch(console.log);
  }, [route.params?.user]);

  const handleScanQR = () => {
    navigation.navigate("Scanner");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome, {user?.name}!</Text>
      <Text variant="bodyLarge">Your balance: ${user?.balance}</Text>
      <Button title="Scan QR Code" onPress={handleScanQR} />

      {cards.length > 0 && (
        <Text variant="headlineSmall" style={{ marginTop: 20 }}>
          Transactions
        </Text>
      )}
      <FlatList
        style={styles.flatlist}
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>ID: {item.id}</Text>
            <Text>Amount: ${item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatlist: {
    marginTop: 5,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: "white",
  },
  card: {
    minWidth: "100%",
    display: "flex",
    flexDirection: "row",
    columnGap: 30,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
