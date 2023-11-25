const parseString = require('xml2js').parseString,
  fs = require('fs'),
  path = require('path'),    
  filePath = path.join(__dirname, 'rekordbox.xml'),
  outputFolderName = 'Playlists';

console.log('Reading file: ' + filePath);

fs.mkdir(path.join(__dirname, outputFolderName), { recursive: true }, (err) => {
  fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
      if (!err) {
        
        parseString(data, function (err, result) {

          const tracks = result.DJ_PLAYLISTS.COLLECTION[0].TRACK;
          const playlists = result.DJ_PLAYLISTS.PLAYLISTS[0].NODE[0].NODE

          playlists.forEach(element => {
            const playlistName = element.$.Name;
            const tracksInPlaylist = element.TRACK;
            const tracksInFile = [];
            const fileName = playlistName + '.m3u';
            const filePath = path.join(__dirname, 'Playlists', fileName);

            if (tracksInPlaylist) {
              Object.values(tracksInPlaylist).forEach(track => {
                const trackId = track.$.Key;
                const trackObject = tracks.find(t => t.$.TrackID === trackId);
                const trackPath = decodeURIComponent(trackObject.$.Location.replace('file://localhost', ''));
                tracksInFile.push(trackPath);
              });
            }

            fs.writeFile(filePath, tracksInFile.join("\n"), function(err) {
              if(err) {
                  return console.log(err);
              }
              console.log(`The playlist ${playlistName} was saved to file ${fileName}.`);
            });

          });
        });
      } else {
          console.log(err);
      }
  });
});


