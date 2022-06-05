// Modules to control application life and create native browser window
const {app, BrowserWindow, session, Menu, shell} = require('electron')
const path = require('path')
const isDev = require("electron-is-dev");
const windowStateKeeper = require('electron-window-state');
const settings = require("electron-settings");
const prompt = require('electron-prompt');
const axios = require('axios');
//const injected = require('./script_prod.js')

// https://www.twitch.tv/subs/saikomicart

isDarkTheme = true;

var service = 'streamelements'

function createPanel(width, height, url) {


  let windowState = windowStateKeeper({
    defaultWidth: width,
    defaultHeight: height
  });
  
  // Create the browser window.
  const window = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    parent: chatWindow,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  windowState.manage(window);
  
  window.loadURL(url)

  return window
}

var chatWindow;

async function createWindow () {

  let chatWindowState = windowStateKeeper({
    defaultWidth: 380,
    defaultHeight: 720
  });
  

  // Create the browser window.
  chatWindow = new BrowserWindow({
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

  var channel = await settings.get("twitch.channel") || 'xqc';

  const twitchPanelBaseURL = `https://dashboard.twitch.tv/popout/u/${channel}/stream-manager`;
  const alwaysontop = await settings.get("menu.alwaysontop");

  // panels

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
          value: channel,
          type: 'input',
          alwaysOnTop: true,
        })
        .then((newChannel) => {
            if(newChannel === null) {
                
            } else {
              channel = newChannel

              settings.set("twitch", {
                channel: newChannel,
              });
              chatWindow.loadURL('https://chitchat.ma.pe/' + newChannel);
              //chatWindow.loadURL('https://www.twitch.tv/popout/'+ newChannel +'/chat?popout=')
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
        {
          label: 'Open stream in Browser',
          click: function(item, browser) {
            shell.openExternal("https://www.twitch.tv/"+channel)
          }
        },
        {
          label: 'Open Player',
          click: function(item, browser) {
            activityFeedWindow = createPanel(100, 100, `https://player.twitch.tv/?channel=${channel}&parent=twitch.tv`)
          }
        },
       /* {
          label: "Paneles",
          submenu: [
            {
              label: "Activity Feed",
              type: "checkbox",
              checked: activityFeed,
              click: function (item, browser) {
                url = ''
                if (service == 'twitch') {
                  url = `${twitchPanelBaseURL}/activity-feed?uuid=1`
                }else if(service == 'streamelements'){
                  url = 'https://yoink.streamelements.com/activity-feed?activitiesToolbar=false&popout=true&theme=dark&withSetupWizard=false'
                }else if(service == 'streamlabs'){
                  url = 'https://streamlabs.com/dashboard/recent-events'
                }

                var state = item.checked;

                if (state || activityFeedWindow) {
                  activityFeedWindow.close()
                } else {
                  activityFeedWindow = createPanel(100, 100, url)
                }
              },
            },
            {
              label: "Edit stream info",
              type: "checkbox",
              checked: editStreamInfo,
              click: function (item, browser) {
                var state = item.checked;
                if (state || editStreamInfoWindow) {
                  editStreamInfoWindow.close()
                } else {
                  editStreamInfoWindow = createPanel(460, 620, `${twitchPanelBaseURL}/edit-stream-info`)
                }
    
                settings.set("menu", {
                  editStreamInfo: state,
                });   
               
              },
            },
            {
              label: "Quick Actions",
              type: "checkbox",
              checked: quickActions,
              click: function (item, browser) {
                var state = item.checked;
                if (state || quickActionsWindow) {
                  quickActionsWindow.close()
                } else {
                  quickActionsWindow = createPanel(100, 100, `${twitchPanelBaseURL}/quick-actions`)
                }
    
                settings.set("menu", {
                  quickActions: state,
                });   
              },
            },
            {
              label: "Stream Preview",
              type: "checkbox",
              checked: streamPreview,
              click: function (item, browser) {
                var state = item.checked;
                if (state || streamPreviewWindow) {
                  streamPreviewWindow.close()
                } else {
                  streamPreviewWindow = createPanel(100, 100, `${twitchPanelBaseURL}/stream-preview`)
                }
    
                settings.set("menu", {
                  streamPreview: state,
                });   
              },
            },
            {
              label: "Moderation Actions",
              type: "checkbox",
              checked: moderationActions,
              click: function (item, browser) {
                var state = item.checked;
                if (state || moderationActionsWindow) {
                  moderationActionsWindow.close()
                } else {
                  moderationActionsWindow = createPanel(100, 100, `${twitchPanelBaseURL}/moderation-actions`)
                }
    
                settings.set("menu", {
                  moderationActions: state,
                }); 
              },
            },
            {
              label: "Predictions",
              type: "checkbox",
              checked: predictions,
              click: function (item, browser) {
                var state = item.checked;
                if (state || predictionsWindow) {
                  predictionsWindow.close()
                } else {
                  predictionsWindow = createPanel(100, 100, `${twitchPanelBaseURL}/predictions`)
                }
    
                settings.set("menu", {
                  predictions: state,
                }); 
              },
            },
            {
              label: "Stream Health",
              type: "checkbox",
              checked: streamHealth,
              click: function (item, browser) {
                var state = item.checked;
                if (state || streamHealthWindow) {
                  streamHealthWindow.close()
                } else {
                  streamHealthWindow = createPanel(100, 100, `${twitchPanelBaseURL}/stream-health`)
                }
    
                settings.set("menu", {
                  streamHealth: state,
                }); 
              },
            },
            {
              label: "Ads",
              type: "checkbox",
              checked: ads,
              click: function (item, browser) {
                var state = item.checked;
                if (state || adsWindow) {
                  adsWindow.close()
                } else {
                  adsWindow = createPanel(100, 100, `${twitchPanelBaseURL}/streamer-ads-manager-panel`)
                }
    
                settings.set("menu", {
                  ads: state,
                }); 
              },
            },
            {
              label: "Rewards Queue",
              type: "checkbox",
              checked: rewardQueue,
              click: function (item, browser) {

                var state = item.checked;
                if (state || rewardQueueWindow) {
                  rewardQueueWindow.close()
                } else {
                  rewardQueueWindow = createPanel(100, 100, `${twitchPanelBaseURL}/reward-queue`)
                }
    
                settings.set("menu", {
                  rewardQueue: state,
                }); 

                createPanel(100, 100, `${twitchPanelBaseURL}/reward-queue`)
              },
            },
            {
              label: "Auto Mod Queue",
              type: "checkbox",
              checked: quickActions,
              click: function (item, browser) {
                createPanel(100, 100, `${twitchPanelBaseURL}/auto-mod-queue`)
              },
            },
            {
              label: "Hosting You",
              type: "checkbox",
              checked: quickActions,
              click: function (item, browser) {
                createPanel(100, 100, `${twitchPanelBaseURL}/hosting-you`)
              },
            },
            {
              label: "Active Mods",
              type: "checkbox",
              checked: quickActions,
              click: function (item, browser) {
                createPanel(100, 100, `${twitchPanelBaseURL}/active-mods`)
              },
            },
            {
              label: "Unban Requests",
              type: "checkbox",
              checked: quickActions,
              click: function (item, browser) {
                createPanel(100, 100, `${twitchPanelBaseURL}/unban-requests`)
              },
            },
          ]
        },*/
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
  //chatWindow.loadURL(`https://www.twitch.tv/popout/${channel}/chat?popout=`)
  chatWindow.loadURL(`https://chitchat.ma.pe/${channel}`)
  // loads BTTV, FFZ and 7tv
  //session.defaultSession.loadExtension(isDev ? localPath : extensionPath)
  const response = await axios.get(
    'https://raw.githubusercontent.com/elmarceloc/EZ-Chat/master/script_prod.js?nocache=' + Math.random()*1000
  )

  console.log('script loaded',response.data.length)
  chatWindow.webContents.on('dom-ready', () => {
    //chatWindow.webContents.executeJavaScript(tabs.addTab(),true)
    
    //loadEmotes(chatWindow)

    chatWindow.webContents.executeJavaScript(response.data)

  
  })
  // open urls in the default browser
  chatWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // Open the DevTools.
  if (isDev) chatWindow.webContents.openDevTools()
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
