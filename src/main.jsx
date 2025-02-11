import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Main } from '@/pages/Main.jsx'
import Characters from '@/pages/Characters.jsx'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

import { Provider } from 'react-redux'
import { store } from './store'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
	<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
		<BrowserRouter>
			<Routes>
				<Route path='/' element={
					<Provider store={store}>
						<Main />
					</Provider>
				}></Route>
				<Route path='/characters' element={
					<Characters />
				}></Route>
			</Routes>
		</BrowserRouter>
	</ThemeProvider>
)
