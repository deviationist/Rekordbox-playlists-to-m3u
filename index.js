const parseString = require('xml2js').parseString,
  fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, 'rekordbox.xml'),
  outputFolderName = 'Playlists',
  outputFolderPath = path.join(__dirname, outputFolderName),
  dryRun = false;

console.log('Reading file: ' + filePath);

function resolvePlaylistName(element, parentElement) {
  const nameParts = [];
  if (parentElement) {
    nameParts.push(parentElement.$.Name);
  }
  nameParts.push(element.$.Name);
  return nameParts.join(' - ');
}

function handleLevel(tracks, element, parentElement) {
  const hasChildren = element.$.Type === '0';

  if (hasChildren) {
    element.NODE.forEach(child => {
      handleLevel(tracks, child, element);
    });
  }

  if (!element.$.Entries) {
    return;
  }

  const playlistName = resolvePlaylistName(element, parentElement);
  const tracksInPlaylist = element.TRACK;

  const tracksInFile = [];
  const fileName = playlistName + '.m3u';
  const filePath = path.join(__dirname, outputFolderName, fileName);

  if (tracksInPlaylist) {
    Object.values(tracksInPlaylist).forEach(track => {
      const trackId = track.$.Key;
      const trackObject = tracks.find(t => t.$.TrackID === trackId);
      const trackPath = decodeURIComponent(trackObject.$.Location.replace('file://localhost', ''));
      tracksInFile.push(trackPath);
    });
  }

  if (dryRun) {
    console.log(`The playlist "${playlistName}" would have been saved to file "${fileName}" with "${tracksInPlaylist.length}" tracks.`);
  } else {
    fs.writeFile(filePath, tracksInFile.join("\n"), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(`The playlist "${playlistName}" was saved to file "${fileName}" with "${tracksInPlaylist.length}" tracks.`);
    });
  }
  
}


if (fs.existsSync(outputFolderPath)) {
  fs.rmSync(outputFolderPath, { recursive: true, force: true });
}
fs.mkdirSync(outputFolderPath);

fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
    if (!err) {
      
      parseString(data, function (err, result) {
        const tracks = result.DJ_PLAYLISTS.COLLECTION[0].TRACK;
        const playLists = result.DJ_PLAYLISTS.PLAYLISTS[0].NODE[0].NODE
        playLists.forEach(playList => handleLevel(tracks, playList));
      });
    } else {
        console.log(err);
    }
});


