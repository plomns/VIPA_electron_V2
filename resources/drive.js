// const fs = require('fs');
// const {OAuth2Client} = require('google-auth-library');
// const {google} = require("googleapis");
// const {shell} = require("electron");
// // Load client secrets from a local file.
// const credentials = JSON.parse(fs.readFileSync('resources\\credentials.json'));
// const http = require('http');
// const url = require('url');
// const port = 3000;

// // Create a new OAuth2 client.
// const client = new OAuth2Client(
//   credentials.installed.client_id,
//   credentials.installed.client_secret,
//   credentials.installed.redirect_uris[0]
// );

// function authorize()  {
//   // Check if an access token exists.
//   let token;
//   try {
//     token = fs.readFileSync('resources\\token.json');
//   } catch (err) {
//     token = null;
//   }

//   // If no token exists, retrieve a new one.
//   if (!token) {
//     const authUrl = client.generateAuthUrl({
//       access_type: 'offline',
//       scope: ['https://www.googleapis.com/auth/drive']
//     });
//     shell.openExternal(authUrl);
//     // If renewing creds, change redirectURL to include port in json file.
//     const server = http.createServer((req, res) => {
//       const query = url.parse(req.url, true).query;
//       const code = query.code;
//       if (!code) {
//         // Send HTML response with redirect to authorization URL
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.end(`<html><head><title>Authorization</title></head><body><p>Please follow <a href="${authUrl}">this link</a> to authorize</p></body></html>`);
//       } else {
//         client.getToken(code, (err, tokens) => {
//           if (err) {
//             console.error('Error retrieving access token', err);
//             res.writeHead(500, { 'Content-Type': 'text/html' });
//             res.end('Error retrieving access token');
//           } else {
//             client.setCredentials(tokens);
//             fs.writeFileSync("resources\\token.json", JSON.stringify(tokens)); // Write token to token.json file
//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.end('<html><head><title>Authorization successful</title></head><body><h1>Authorization successful!</h1><p>You can return to V.I.P.A</p></body></html>');
//             server.close();
//           }
//         });
//       }
//     });
    
//     const port = 3000; // Specify the port number to listen on
//     server.listen(port, () => {
//       console.log(`Server is listening on port ${port}`);
//     });

//   } else {
//     client.setCredentials(JSON.parse(token));
//     dateDir(os.homedir()+"\\Music\\VIPAMUSIC").catch(console.error);
//   }
// }

// var folderID = "";
// function checkFolder(files) {
//   for (var i = 0; i<files.length;i++)
//     {
//         if (files[i].name == "VIPAMUSIC")
//         {
//           folderID = files[i].id;
//           return true;
//         }
//     }
//   return false;
// }

// async function dateDir(offlineDir) {
//   const drive = google.drive({version: 'v3', auth: client});
//   const res = await drive.files.list({
//     fields: 'nextPageToken, files(id, name)',
//     q: "trashed = false",
//   });
//   const files = res.data.files;
//   if (files.length === 0) {
//     console.log('No files found.');
//     return;
//   }
//   const fileMetadata = {
//     name: 'VIPAMUSIC',
//     mimeType: 'application/vnd.google-apps.folder',
//   };
//   if (!checkFolder(files)) {
//       let create = await drive.files.create({
//         resource: fileMetadata,
//         fields: "id",
//     });
//     folderID = create.data.id;
//   }
  
//   await syncFiles(offlineDir).then(() => {
//     console.log("done");
//   });
// }
// async function syncFiles(localPath) {
//   const drive = google.drive({version: 'v3', auth: client});
//   // Get a list of files in the Google Drive folder
//   const driveFiles = (await drive.files.list({
//     q: `'${folderID}' in parents and trashed=false`,
//   })).data.files;

//   // Get a list of local files
//   const localFiles = fs.readdirSync(localPath, {
//     withFileTypes: false,
//   });
//   const zlib = require('zlib');
//   // Upload new local files to Google Drive
//   for (const file of localFiles) {
//     if (!driveFiles.find((f) => f.name === file)) {
//       // Upload the local file to Google Drive

//       // use above to zip then upload then on download unzip to workaround upload issues.
//       const fileData = fs.readFileSync(`${localPath}\\${file}`);
//       zlib.gzip(fileData, (err, compressedData) => {
//         if (err) throw err;
//         else { 
//           const options = {
//             method: 'POST',
//             url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=media`,
//             headers: {
//               'Authorization': `Bearer ${client.credentials.access_token}`,
//               'Content-Type': 'application/octet-stream',
//             },
//             data: compressedData,
//           };
    
//           // Make the Axios request to upload the file to Google Drive.
//           axios(options)
//             .then(response => {
//               drive.files.update({
//                 fileId: response.data.id,
//                 addParents: [folderID],
//                 requestBody: {
//                   name: file+".zip",
//                 }
//               });
//             })
//             .catch(error => {
//               console.error(error);
//             });
//         }
//       });
//     };
// }

//   // Download new Google Drive files to local folder
//   for (const file of driveFiles) {
//     if (!fs.existsSync(`${localPath}\\${file.name}`)) {
//       // Download the Google Drive file
      
//       // drive.files.get(
//       //   {
//       //     fileId: file.id,
//       //     alt: "media",
//       //   },
//       //   { responseType: "arraybuffer" },
//       //   function(err, { data }) {
//       //     fs.writeFile(`${localPath}/${file.name}`, Buffer.from(data), err => {
//       //       if (err) console.log(err);
//       //     });
//       //   }
//       // );
//     }
//   }
// }