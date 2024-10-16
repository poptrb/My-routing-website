export function getUserCoordinates(geolocationAPI, setLat, setLong) {
  if (!geolocationAPI) {
    console.log("Geolocation API is not available in your browser!");
  } else {
    geolocationAPI.getCurrentPosition(
      (position) => {
        const { coords } = position;
        setLat(coords.latitude);
        setLong(coords.longitude);
      },
      (error) => {
        console.log("Something went wrong getting your position!");
      }
    );
  }
}
