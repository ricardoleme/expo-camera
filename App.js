// cSpell:ignore Permissao, Ionicons

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Platform, Alert, Modal, Image } from 'react-native';
import { Camera } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons';
import Header from './components/Header'

export default function App() {
  //tipo inicial da câmera (front ou back)
  const [tipoCamera, setTipoCamera] = useState(Camera.Constants.Type.back)
  //status do acesso à câmera
  const [temPermissao, setTemPermissao] = useState(null)
  //referência da câmera
  const cameraRef = useRef(null)
  //referência a foto capturada
  const [fotoCapturada, setFotoCapturada] = useState(null)
  //controle de exibição do Modal da Foto
  const [exibeModalFoto, setExibeModalFoto] = useState(false)

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        const cameraDisponível = await Camera.isAvailableAsync()
        setTemPermissao(!cameraDisponível)
      } else {
        const { status } = await Camera.requestPermissionsAsync();
        setTemPermissao(status === 'granted')
      }
    })();
  }, []);


  if (temPermissao === null) {
    return (<View><Text>Conteúdo Nulo</Text></View>)
  }

  if (temPermissao === false) {
    return <Text>Acesso negado à câmera ou o seu equipamento não dispõem de uma!</Text>;
  }

  async function tirarFoto() {
    if (cameraRef) {
      const foto = await cameraRef.current.takePictureAsync()
      Alert.alert(
        'Foto capturada',
        `A sua foto ${foto.height}X${foto.width} foi capturada com sucesso!`,
        [
          {
            text: 'Dispensar aviso',
            onPress: () => console.log('Dispensar aviso pressionado')
          },
          {
            text: 'Cancelar',
            onPress: () => console.log('Cancelar pressionado'),
            style: 'cancel'
          },
          { text: 'OK', onPress: () => console.log('OK pressionado') }
        ],
        { cancelable: false }
      );
      setFotoCapturada(foto.uri)
      setExibeModalFoto(true)
      console.log(foto)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="FateCam" />
      <Camera
        style={{ flex: 1 }}
        type={tipoCamera}
        ref={cameraRef}
      >
        <View style={styles.camera}>
          <TouchableOpacity
            style={styles.touch}
            onPress={tirarFoto}
          >
            <Ionicons name="md-camera" size={40} color="#9E9E9E" />
            { /*Consulte a lista de ícones em: https://icons.expo.fyi */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touch}
            onPress={() => {
              setTipoCamera(
                tipoCamera === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )
            }}
          >
            <Ionicons name="md-reverse-camera" size={40} color="#9E9E9E" />
            { /*Consulte a lista de ícones em: https://icons.expo.fyi */}
          </TouchableOpacity>
        </View>
      </Camera>
      {fotoCapturada &&
        <Modal
          animationType="slide"
          transparent={false}
          visible={exibeModalFoto}
        >
          <View style={{flex:1, backgroundColor:'#BBB'}}>
            <TouchableOpacity style={{ margin: 10, flexDirection: 'row-reverse' }} onPress={() => setExibeModalFoto(false)}>
              <Ionicons name="md-close-circle" size={50} color="red" />
            </TouchableOpacity>

            <Image
              source={{ uri: fotoCapturada }}
              style={{width: '100%', height: '70%', borderRadius: 30}}
            />
          </View>
        </Modal>

      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  camera: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  touch: {
    margin: 20
  }
});

