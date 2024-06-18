import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import Login from './Login.tsx'
import Profile from './Profile.tsx';

import './index.css'
import Admins from './Admins.tsx';
import Leaders from './Leaders.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <NextThemesProvider
    defaultTheme='dark'
  >
    <NextUIProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/:uid' element={<Profile />} />
          <Route path='/admins' element={<Admins />} />
          <Route path='/leaders' element={<Leaders />} />
        </Routes>
      </Router>
    </NextUIProvider>
  </NextThemesProvider>
  ,
)
