// Modules to control application life and create native browser window
const {app, BrowserWindow, session, Menu} = require('electron')
const path = require('path')
const isDev = require("electron-is-dev");
const windowStateKeeper = require('electron-window-state');
const settings = require("electron-settings");
const prompt = require('electron-prompt');

isDarkTheme = true;

/**
 * Generates a script that can be injected to enable the twitch's Better TTV emotes.
 * @param isDarkTheme if streamlabs is in dark mode
 * @return a javascript script
 */

function enableBTTVEmotesScript(isDarkTheme) {
    /*eslint-disable */
  return `
  localStorage.setItem('bttv_clickTwitchEmotes', true);
  localStorage.setItem('bttv_darkenedMode', ${
    isDarkTheme ? 'true' : 'false'
  });
  
  var bttvscript = document.createElement('script');
  bttvscript.setAttribute('src','https://cdn.betterttv.net/betterttv.js');
  document.head.appendChild(bttvscript);
  
  function loadLazyEmotes() {
    var els = document.getElementsByClassName('lazy-emote');
  
    Array.prototype.forEach.call(els, el => {
      const src = el.getAttribute('data-src');
      if (el.src !== 'https:' + src) el.src = src;
    });
  
    setTimeout(loadLazyEmotes, 1000);
  }
  
  loadLazyEmotes();
  0;
  `
    /*eslint-enable */
}

const extensionPath = __dirname.split("app.asar")[0] + "7tv";
const localPath = "D:/proyectos/twitch-chat-pc/7tv"


async function createWindow () {

  let chatWindowState = windowStateKeeper({
    defaultWidth: 380,
    defaultHeight: 720
  });
  

  // Create the browser window.
  const chatWindow = new BrowserWindow({
    x: chatWindowState.x,
    y: chatWindowState.y,
    width: chatWindowState.width,
    height: chatWindowState.height,
    //autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  chatWindowState.manage(chatWindow);

  const alwaysontop = await settings.get("menu.alwaysontop")
  const channel = await settings.get("twitch.channel") || 'xqcow'

  console.log(alwaysontop, channel)

  if (alwaysontop) {
    BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true, "floating");
  } else {
    BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false);
  }

  const menu = [
    {
      label: 'Channel',
      click() {
        prompt({
          title: 'Enter your twitch username',
          label: 'Twitch username:',
          value: 'xqcow',
          type: 'input',
          alwaysOnTop: true,
        })
        .then((channel) => {
            if(channel === null) {
                
            } else {

              settings.set("twitch", {
                channel: channel,
              });

              chatWindow.loadURL('https://www.twitch.tv/popout/'+ channel +'/chat?popout=')

              chatWindow.webContents.on('dom-ready', () => loadEmotes(chatWindow) )
            }
        })
        .catch(console.error);
      }
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: "Always on top",
          type: "checkbox",
          checked: alwaysontop,
          click: function (item, browser) {
            var state = item.checked;
        
            if (state) {
              BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true, "floating");
            } else {
              BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false);
            }

            settings.set("menu", {
              alwaysontop: state,
            });   
          },
        },
        { role: 'zoomin', accelerator: 'CommandOrControl+=' },
        { role: 'zoomout' },
        {
          label: 'Recargar',
          accelerator: "CmdOrCtrl+R",
          click: () => {
            chatWindow.reload();
          }
        },
      ]
    }
  ];

  chatWindow.setMenu(Menu.buildFromTemplate(menu))

  // Loads the twitch's chat popup for the user channel
  chatWindow.loadURL('https://www.twitch.tv/popout/'+ channel +'/chat?popout=')

  // loads BTTV, FFZ and 7tv
  session.defaultSession.loadExtension(isDev ? localPath : extensionPath)

  chatWindow.webContents.on('dom-ready', () => loadEmotes(chatWindow) )
    
  // Open the DevTools.
 // if (isDev) chatWindow.webContents.openDevTools()
}

function loadEmotes(window) {
  // loads bttv emotes if their are enabled
  window.webContents.executeJavaScript(enableBTTVEmotesScript(isDarkTheme),true);

  // loads ffz emotes if their are enabled
  window.webContents.executeJavaScript(
    `
      var ffzscript1 = document.createElement('script');
      ffzscript1.setAttribute('src','https://cdn.frankerfacez.com/script/script.min.js');
      document.head.appendChild(ffzscript1);
      0;
    `,
    true,
    );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
