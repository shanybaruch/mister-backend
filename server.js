import express  from 'express'
import http from 'http'
import cors  from 'cors'
import path, { dirname } from 'path'
import cookieParser from 'cookie-parser'
import { logger } from './services/logger.service.js'
import { fileURLToPath } from 'url'

import { reviewRoutes } from './api/review/review.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    // Configuring CORS
    // Make sure origin contains the url 
    // your frontend dev-server is running on
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173', 
            'http://localhost:5173',
            'http://127.0.0.1:3000', 
            'http://localhost:3000',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'


app.all('*all', setupAsyncLocalStorage)

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)

setupSocketAPI(server)

// Make every unmatched server-side-route fall back to index.html
// So when requesting http://localhost:3030/index.html/toy/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

logger.info('server.js loaded...')
const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})
// app.listen(port, () => {
//     logger.info('Server is running on port: ' + port)
// })