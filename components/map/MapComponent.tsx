import { Platform } from 'react-native';
import MapComponentNative from './MapComponent.native';
import MapComponentWeb from './MapComponent.web';

export const MapComponent = Platform.OS === 'web' ? MapComponentWeb : MapComponentNative;
export default MapComponent;
