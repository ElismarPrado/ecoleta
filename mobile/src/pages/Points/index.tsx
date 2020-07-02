import React, { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Feather as Icon } from '@expo/vector-icons'
import { Alert, 
    Text, 
    View, 
    Image, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    SafeAreaView,
    ActivityIndicator 
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location'
import api from '../../services/api'

interface Item {
    id: number
    title: string
    image_url: string
}

interface Point {
    id: number
    name: string
    image: string
    image_url: string
    latitude: number
    longitude: number
}

interface Params {
    uf: string
    city: string
}

const Points = () => {
    const [items, setItems] = useState<Item[]>([])
    const [points, setPoints] = useState<Point[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    const navigation = useNavigation()
    const route = useRoute()

    const routeParams = route.params as Params

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync()

            if(status !== 'granted') {
                Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização')
            }

            const location = await Location.getCurrentPositionAsync()

            const { latitude, longitude } = location.coords

            setInitialPosition([latitude, longitude])
        }

        loadPosition()
    }, [])

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    })

    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data)
        })
    }, [selectedItems])

    function handleNavigateBack() {
        navigation.goBack()
    }

    function handleNavigateToDetail(id: number){
        navigation.navigate('Detail', { point_id: id })
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id)
        
        if (alreadySelected >=0) {
            const filteredItens = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItens)
        } else {
            setSelectedItems([ ...selectedItems, id ])
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View  style={styles.container}>
            <TouchableOpacity onPress={handleNavigateBack}>
                <Icon name="arrow-left" size={20} color="#34cb79" />
            </TouchableOpacity>

            <Text style={styles.title}>Bem vindo.</Text>
            <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

            <View style={styles.mapContainer}>
                { initialPosition[0] !== 0 ? (
                    <MapView 
                    style={styles.map} 
                    initialRegion={{
                        latitude: initialPosition[0],
                        longitude: initialPosition[1],
                        latitudeDelta: 0.024,
                        longitudeDelta: 0.024,
                    }}
                    >
                    {points.map(point => (
                        <Marker 
                        key={String(point.id)}
                        style={styles.mapMarker}
                        onPress={() => handleNavigateToDetail(point.id)}
                        coordinate={{
                            latitude: point.latitude,
                            longitude: point.longitude,
                        }}
                        >
                            <View style={styles.mapMarkerContainer}>
                                <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }}/>
                                <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>  
                )
                :<ActivityIndicator size="large" color="#424242" />
                }  
            </View>
        </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                    {items.map(item => (
                      <TouchableOpacity 
                        key={String(item.id)} 
                        style={[
                            styles.item, 
                            selectedItems.includes(item.id) ? styles.selectedItem : {}
                        ]} 
                        onPress={() => handleSelectedItem(item.id)} 
                        activeOpacity={0.5}
                        >
                          <SvgUri width={30} heigth={30} uri={item.image_url} />
                          <Text style={styles.itemTitle}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Points

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 50,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: "center",
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 60,
      height: 60, 
    },
  
    mapMarkerContainer: {
      width: 60,
      height: 60,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 60,
      height: 38,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 8,
      textAlign: 'center',
      width: '80%',
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 100,
      width: 100,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 10,
    },
  });