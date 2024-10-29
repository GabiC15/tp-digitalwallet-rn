import { Camera, CameraView } from "expo-camera";
import { Text } from "react-native-paper";
import { StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../App";

export const ScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);
    try {
      const transactionData = JSON.parse(data);
      const response = await fetch(`${API_URL}/process-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${global.userToken}`,
        },
        body: JSON.stringify({ transactionId: transactionData.transactionId }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log(updatedUser.user);
        Alert.alert("Succesful", "Payment successful.");
        navigation.navigate("Home", { user: updatedUser.user });
      } else {
        Alert.alert("Error", "Payment failed.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
});
