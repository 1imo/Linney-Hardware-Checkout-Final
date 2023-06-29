import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setQrCodeData(data);
    console.log("SCAN")
    console.log(data)

    let res = axios.post("http://172.20.10.13:5000/api/helper/collection", {
      transaction: data
    })

    console.log(res.data)
    // setScanned(false);
    // setInterval(() => setScanned(false), 1000)
    // handleBarCodeScanned()
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
      />

      <View>
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text>{scanned ? "Scan Another" : "Scanning"}</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.qrCodeData}>{qrCodeData}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeData: {
    color: "rgb(0, 0, 0)",
    
  },
  camera: {
    height: "50%",
    width: "100%"
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: "#2191FB",
    boxSizing: "border-box",
    marginTop: 20,
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  }
});
