import {convertAndMapSpeed} from '../utils/utils'
import {GeolocateControl, LngLat} from 'mapbox-gl'

export function extend(dest,  ...sources) {
    for (const src of sources) {
        for (const k in src) {
            dest[k] = src[k];
        }
    }
    return dest
}

export class MyGeolocateControl extends GeolocateControl {
  _updateCamera(position) {
        const center = new LngLat(position.coords.longitude, position.coords.latitude);
        const radius = position.coords.accuracy;
        const bearing = this._heading || this._map.getBearing();
        const pitch = convertAndMapSpeed(position.coords.speed)
        const options = extend({bearing, pitch}, this.options.fitBoundsOptions);

        this._map.fitBounds(center.toBounds(radius), options, {
            geolocateSource: true // tag this camera change so it won't cause the control to change to background state
        });
    }

}

export default MyGeolocateControl;
