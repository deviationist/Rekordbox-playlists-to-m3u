require('dotenv').config();
const parseString = require('xml2js').parseString,
  fs = require('fs'),
  path = require('path'),
  xmlFileName = process.env.XML_FILENAME ?? 'rekordbox.xml',
  xmlFilePath = path.join(__dirname, xmlFileName),
  outputFolderName = process.env.OUTPUT_FOLDER_NAME ?? 'Playlists',
  outputFolderPath = path.join(__dirname, outputFolderName),
  useSubfolders = process.env.USE_SUBFOLDERS ? process.env.USE_SUBFOLDERS === 'true' : true, // Default true
  dryRun = process.env.DRY_RUN === 'true',
  lineDelimiter = process.env.LINE_DELIMITER ?? "\n";

console.log('Reading file: ' + xmlFilePath);

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

  const playlistName = resolvePlaylistName(element, useSubfolders ? null : parentElement);
  const tracksInPlaylist = element.TRACK;

  if (tracksInPlaylist) {
    const tracksInFile = [];
    const fileName = `${playlistName}.m3u`;
    let filePath;

    if (useSubfolders) {
      const subFolderName = parentElement ? parentElement.$.Name : '';
      const subFolderPath = path.join(__dirname, outputFolderName, subFolderName);
      filePath = path.join(subFolderPath, fileName);

      if (!fs.existsSync(subFolderPath)) {
        fs.mkdirSync(subFolderPath, { recursive: true });
      }
    } else {
      filePath = path.join(__dirname, outputFolderName, fileName);
    }
    
    Object.values(tracksInPlaylist).forEach(track => {
      const trackId = track.$.Key;
      const trackObject = tracks.find(t => t.$.TrackID === trackId);
      const trackPath = decodeURIComponent(trackObject.$.Location.replace('file://localhost', ''));
      tracksInFile.push(trackPath);
    });

    const resultMessage = `${tracksInPlaylist.length} tracks in playlist "${playlistName}" ${dryRun ? 'would have been' : 'was'} written to file "${fileName}"`;
    if (dryRun) {
      console.log(resultMessage);
    } else {
      fs.writeFile(filePath, tracksInFile.join(lineDelimiter), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log(resultMessage);
      });
    }
  }
}

if (!fs.existsSync(xmlFilePath)) {
  console.log('XML-file not found. Please check filename and path.');
  return;
}

if (fs.existsSync(outputFolderPath)) {
  fs.rmSync(outputFolderPath, { recursive: true, force: true });
}
fs.mkdirSync(outputFolderPath);

fs.readFile(xmlFilePath, {encoding: 'utf-8'}, function(error, data) {
    if (!error) {
      parseString(data, function (err, result) {
        const tracks = result.DJ_PLAYLISTS.COLLECTION[0].TRACK;
        const playLists = result.DJ_PLAYLISTS.PLAYLISTS[0].NODE[0].NODE
        playLists.forEach(playList => handleLevel(tracks, playList));
      });
    } else {
        console.log('An error occurred:', error);
    }
});


