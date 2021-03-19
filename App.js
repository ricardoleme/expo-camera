import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View, SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Image,
  ToastAndroid
} from 'react-native';
import { Camera } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons';
import Header from './components/Header'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'

//Para o IoS, utilizar react-native-tiny-toast
export default function App() {
  //tipo inicial da câmera (front ou back)
  const [tipoCamera, setTipoCamera] = useState(Camera.Constants.Type.back)
  //status inicial do flash
  const [tipoFlash, setTipoFlash] = useState(Camera.Constants.FlashMode.on)
  //status do acesso à câmera
  const [temPermissao, setTemPermissao] = useState(null)
  //status do acesso à galeria
  const [temPermissaoGaleria, setTemPermissaoGaleria] = useState(null)
  //referência da câmera
  const cameraRef = useRef(null)
  //referência a foto capturada
  const [fotoCapturada, setFotoCapturada] = useState(null)
  //controle de exibição do Modal da Foto
  const [exibeModalFoto, setExibeModalFoto] = useState(false)
  //tipo do icone que será exibido
  const [iconePadrao, setIconePadrao] = useState('md')

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

    (async () => {
      //solicita permissao a galeria de imagens
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      setTemPermissaoGaleria(status === 'granted')
    }
    )();

  }, []);

  useEffect(() => {
    //dependendo do Sistema Operacional, exibiremos diferentes ícones
    switch (Platform.OS) {
      case 'android':
        setIconePadrao('md')
        break
      case 'ios':
        setIconePadrao('ios')
        break
    }
  }, [])

  if (temPermissao === false) {
    return <Text>Acesso negado à câmera ou o seu equipamento não dispõem de uma!</Text>;
  }

  async function tirarFoto() {
    if (cameraRef) {
      await obterResolucoes()
      const options = {
        quality: 0.5,
        skipProcessing: true,
        base64: true
      }
      const foto = await cameraRef.current.takePictureAsync(options)
      setFotoCapturada(foto.uri)
      setExibeModalFoto(true)


      let msg = 'Foto capturada com sucesso!'
      iconePadrao === 'md'
        ? ToastAndroid.showWithGravity(
          msg,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        )
        : Alert.alert('Imagem capturada', msg)




      //console.log(foto)

    }
  }

  async function obterResolucoes() {
    var resolucoes = await cameraRef.current.getAvailablePictureSizesAsync("16:9");
    console.log("Resoluções suportadas: " + JSON.stringify(resolucoes))
    if (resolucoes && resolucoes.length && resolucoes.length > 0) {
      console.log("Maior qualidade: " + resolucoes[resolucoes.length - 1])
      console.log("Menor qualidade: " + resolucoes[0])
    }
  }

  async function salvaFoto() {
    if (temPermissaoGaleria) {
      setExibeModalFoto(false)
      const asset = await MediaLibrary.createAssetAsync(fotoCapturada);
      await MediaLibrary.createAlbumAsync('Fatecam', asset, false);
    }
    else {
      Alert.alert('Sem permissão', 'Infelizmente o App não possui permissão para salvar')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="FateCam" />
      <Camera
        style={{ flex: 1 }}
        type={tipoCamera}
        ref={cameraRef}
        flashMode={tipoFlash}
        ratio={"16:9"}
      >

        <View style={styles.camera}>
          <TouchableOpacity
            style={styles.touch}
            onPress={tirarFoto}
          >
            <Ionicons name={`${iconePadrao}-camera`} size={40} color="#9E9E9E" />
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
            <Ionicons name={`${iconePadrao}-camera-reverse`} size={40} color="#9E9E9E" />

          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touch}
            onPress={() => {
              setTipoFlash(
                tipoFlash === Camera.Constants.FlashMode.on
                  ? Camera.Constants.FlashMode.off
                  : Camera.Constants.FlashMode.on
              )
            }}
          >
            <Ionicons name={
              tipoFlash === Camera.Constants.FlashMode.on
                ? iconePadrao + "-flash"
                : iconePadrao + "-flash-off"
            } size={40} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      </Camera>

      {fotoCapturada &&

        <Modal
          animationType="slide"
          transparent={true}
          visible={exibeModalFoto}
        >
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row-reverse' }}>
              <TouchableOpacity
                style={{ margin: 2 }}
                onPress={() => {
                  setExibeModalFoto(false)
                }}
                accessible={true}
                accessibilityLabel="Fechar"
                accessibilityHint="Fecha a janela atual"
              >
                <Ionicons name={`${iconePadrao}-close-circle`} size={40} color="#d9534f" />
              </TouchableOpacity>

              <TouchableOpacity style={{ margin: 2 }} onPress={salvaFoto}>
                <Ionicons name={`${iconePadrao}-cloud-upload`} size={40} color="#121212" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: fotoCapturada }}
              style={{ width: '90%', height: '70%', borderRadius: 20 }}
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
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    opacity: 0.95,
    alignItems: "center",

  }
});

