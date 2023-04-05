import express from 'express'
// Importar el middleware checkAuth
import checkAuth from "../middleware/checkAuth.js"
// Importar el controllers
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
} from '../controllers/tareaController.js'

const router = express.Router()

router.post('/', checkAuth, agregarTarea)
router
    .route('/:id')
    .get(checkAuth, obtenerTarea)
    .put(checkAuth, actualizarTarea)
    .delete(checkAuth, eliminarTarea)
router.post('/estado/:id', checkAuth, cambiarEstado)

export default router