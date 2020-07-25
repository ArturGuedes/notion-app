const { app, BrowserWindow, BrowserView, ipcMain } = require('electron')
const path = require('path')


const windowConfig = {
  width: 900,
  height: 700,
}

function createWindow() {
  // Janela principal
  let win = new BrowserWindow({
    frame: false,
    height: windowConfig.height,
    icon: path.join(__dirname, 'assets','icon.ico'),
    title: "Notion Unofficial",
    width: windowConfig.width,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  // Página Notion.so
  let view = new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))
  win.on('closed', () => app.quit())

  win.setBrowserView(view)

  view.setBounds({ x: 0, y: 35, width: windowConfig.width, height: windowConfig.height - 35 })
  view.setAutoResize({ width: true, height: true })
  view.webContents.loadURL('https://www.notion.so/login')

  view.webContents.on('dom-ready', function (e) {
    // Injeta um MutationObserver para identificar que alterações na tag body e sobrescreve o titulo da página com o nome das classes de body
    view.webContents.executeJavaScript(`
      function callback(mutationsList) {
        mutationsList.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            document.title = document.getElementsByTagName('body')[0].className;
            //alert("className",document.getElementsByTagName('body')[0].className;);
          }
        })
      }
      const mutationObserver = new MutationObserver(callback);
      mutationObserver.observe(
        document.getElementsByTagName("body")[0],
        { attributes: true }
      )
    `)
  })

  // Captura alteração do título da página
  view.webContents.on('page-title-updated', (evt, title) => {
    if (title.includes('notion-body')) {
      //console.log("~>",title)
      if (title.includes('dark')) {
        win.webContents.send('changeTheme', "dark");
      } else {
        win.webContents.send('changeTheme', "light");
      }
    }
  })

}

app.userAgentFallback = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/72.0"
app.whenReady().then(createWindow)