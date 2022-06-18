import AsyncStorage from '@react-native-async-storage/async-storage'

export async function storeData ( value, key ) {
    try {
        await AsyncStorage.setItem( key, JSON.stringify( value ) )
    } catch ( e ) {
        // saving error
        console.log( 'erro ao salvar dados locais -> ', e )
    }
}

export async function getData ( key ) {
    try {
        const value = await AsyncStorage.getItem( key )
        if ( value !== null ) return JSON.parse( value )
        return null
    } catch ( e ) {
        // error reading value
        console.log( 'erro ao ler dados locais -> ', e )
    }
}