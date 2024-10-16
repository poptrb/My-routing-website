export function add_pulsing_dot_features(mapRef, features,) {
  console.log('add pulsating dot feature called!')
  const size = 200;
  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    render: function () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
      );
      context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
      context.fill();

      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 100, 100, 1)';
      context.strokeStyle = 'white';
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;

      mapRef.current.triggerRepaint();

      return true;
    },
  };

  mapRef.current.on('load', () => {
    mapRef.current.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });


    mapRef.current.addSource('dot-point', {
       type: 'geojson',
         data: {
           type: 'FeatureCollection',
             features: [
               {
                 type: 'Feature',
                 geometry: {
                   type: 'Point',
                   coordinates: [features[0].location.long, features[0].location.lat]
                 }
               }
             ]
          }
      });

   mapRef.current.addLayer({
     id: 'layer-with-pulsing-dot',
     type: 'symbol',
     source: 'dot-point',
     layout: {
       'icon-image': 'pulsing-dot'
     }
   });
 });
};

export const fetchReports = async () => {
  try {
    const response = await fetch('http://localhost:8001');
    const data = await response.json();
    console.log(data); // Handle the JSON data as needed

    let features = []
    for(let report of data) {
      features.push(
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [report.location.long, report.location.lat]
          }
        });
       };
    return {
      'report_data': data,
      'features': features
    }

  } catch (error) {
     console.error('Error fetching data:', error);
  }
};
