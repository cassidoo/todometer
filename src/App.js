import React from 'react'
import TodoDate from './components/TodoDate'

import ItemList from './components/ItemList'
import { AppStateProvider } from './AppContext'
import { Titlebar, Color } from 'custom-electron-titlebar'
function App() {

  new Titlebar({
    backgroundColor: Color.fromHex('#403F4D'),
  })

  return (
    <AppStateProvider>
      <TodoDate />
      <ItemList />
    </AppStateProvider>
  )
}

export default App
