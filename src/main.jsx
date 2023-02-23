import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { ConvexProvider, ConvexReactClient } from "convex/react";

const address = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(address);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
)
