# Rekordbox Playlists to M3U
This project is a CLI-tool that will convert your Rekordbox XML-export to individual M3U-files that you can import, for example Traktor Pro etc.

## Getting started
1. Open Rekordbox, click "File" in the top bar, then click "Export Collection in xml format", save it as filename "rekordbox.xml"
2. Run command `npm ci` in the root folder of this project 
3. Place the XML-file in the root folder of this project
4. Run command `npm run convert`
5. Et voilà - after a successful conversion the M3U-files should be located in a folder called "Playlists"

If you want more control over the configuration you can make a copy the file `.env.example` and call it `.env`. You can then configure the name of the XML-file, the output foldername, whether to respect playlists in subfolders etc.