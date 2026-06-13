const m = require('react-native-maps');
console.log('top keys', Object.keys(m));
console.log('has default', !!m.default, 'default type', typeof m.default);
console.log('has MapView', !!m.MapView, 'MapView type', typeof m.MapView);
console.log('has Marker', !!m.Marker, 'Marker type', typeof m.Marker);
console.log('has Polyline', !!m.Polyline, 'Polyline type', typeof m.Polyline);
console.log('has PROVIDER_GOOGLE', !!m.PROVIDER_GOOGLE, typeof m.PROVIDER_GOOGLE);
console.log('MapView value', m.default?.MapView || m.MapView || m.default || m);
console.log('MapView raw', m.default?.MapView ? 'default.MapView' : m.MapView ? 'MapView' : m.default ? 'default' : 'root');
