// CommonJS
// const express = require('express');

// Module (imports)
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
// Socket.io (imports)
import { Server } from 'socket.io'
// Importar archivos propios (agregar su extension .js)
import conectarDB from './config/db.js'     // Importar la configuracion de conexion de la DB
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'
// import prueba from './prueba.js'

const app = express()
app.use(express.json())     // Habilitar la lectura o procesar JSON

// Llamar a la config de dotenv (Busca un archivo .env)
dotenv.config()

// Llamar a la funcion de conexion a la DB
conectarDB()

// Configurar CORS (Llamando al valor de la variable de entorno)
const whitelist = [process.env.FRONTEND_URL]     // Lista blanco (dominios permitidos)

const corsOptions = {
    origin: function (origin, callback) {
        // console.log(origin)
        if (whitelist.includes(origin)) {
            // Puede consultar la API
            callback(null, true)
        } else {
            // No esta permitido
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))

// Llamar a una variable de entorno
// console.log(process.env.HOLA)

// console.log('Desde index.js')

// Routing
// Solicitud HTTP GET
// app.get('/', (req, res) => {
//     res.send('Hola Mundo!')
// })
// Responde a todos los verbos HTTP
// app.use('/', (req, res) => {     // req: datos enviados y res: respuesta que recibe de la petición
//     // res.send('Hola Mundo!')
//     res.json({'msg': 'OK'})
// })
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000       // La variable entorno PORT se inyectará automaticamente en prod y en local sera 4000

const servidor = app.listen(PORT, () => {
    console.log(`Sevidor corriendo en el puerto ${PORT}`)
})


// Configuraciones de socket.io
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    },
})

io.on('connection', (socket) => {
    console.log('Conectando a socket.io')

    // Definir los eventos de socket.io
    socket.on('abrir proyecto', (proyecto) => {
        // console.log('Desde el proyecto ', proyecto)

        // Cada proyecto entra a un socket diferente (room)
        socket.join(proyecto)

        // Emitir un respuesta a socket.io-client (frontend)
        // socket.emit('respuesta', { nombre: 'Adriano' })
        // socket.to('639b1adb70b46e34414722c3').emit('respuesta', { nombre: 'Adriano' })
    })

    // Escuchar el evento 'nueva tarea'
    socket.on('nueva tarea', (tarea) => {
        // console.log(tarea)

        const proyecto = tarea.proyecto
        // Emitir el proyecto (frontend)
        // socket.on(tarea.proyecto)
        // socket.on(proyecto).emit('tarea agregada', tarea)
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    // Escuchar el 2vento 'eliminar tarea' (desde el frontend)
    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        // socket.in(proyecto).emit('tarea eliminada', tarea)   // in igual a to
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    // Escuchar el evento 'actualizar tarea' (desde el frontend)
    socket.on('actualizar tarea', tarea => {
        // console.log(tarea)
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})