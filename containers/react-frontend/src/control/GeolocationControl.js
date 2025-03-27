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
        const options = extend({bearing, pitch, duration: 750}, this.options.fitBoundsOptions);

        this._map.fitBounds(center.toBounds(radius), options, {
            geolocateSource: true // tag this camera change so it won't cause the control to change to background state
        });
    }

// Modified _onDeviceOrientation method
  _onDeviceOrientation(deviceOrientationEvent) {
    // absolute is true if the orientation data is provided as the difference between the Earth's coordinate frame and the device's coordinate frame, or false if the orientation data is being provided in reference to some arbitrary, device-determined coordinate frame.
    if (this._userLocationDotMarker) {
        let headingChanged = false;
        const oldHeading = this._heading;

        if (deviceOrientationEvent.webkitCompassHeading) {
            // Safari
            this._heading = deviceOrientationEvent.webkitCompassHeading;
            headingChanged = oldHeading !== this._heading;
        } else if (deviceOrientationEvent.absolute === true) {
            // non-Safari alpha increases counter clockwise around the z axis
            this._heading = deviceOrientationEvent.alpha * -1;
            headingChanged = oldHeading !== this._heading;
        }

        this._updateMarkerRotationThrottled();

        // Only update camera if in ACTIVE_LOCK state, we have a position, and heading changed significantly
        // Use a threshold to avoid constant small updates
        if (headingChanged &&
            this._watchState === 'ACTIVE_LOCK' &&
            this._lastKnownPosition &&
            Math.abs((oldHeading || 0) - (this._heading || 0)) > 1) {

            // Instead of directly manipulating the map, simulate a position update
            // with the same position but new heading
            const simulatedPosition = this._lastKnownPosition;

            // This will reuse all the existing control flow with geolocateSource properly set
            this._updateCamera(simulatedPosition);
        }
    }
}
}
