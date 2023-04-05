import express from "express"
// Importar el middleware checkAuth
import checkAuth from "../middleware/checkAuth.js"
// Impotar controller
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
    /*obtenerTareas,*/
} from '../controllers/proyectoController.js'

const router = express.Router()

// router.get('/', checkAuth, obtenerProyectos)
// router.post('/', checkAuth, nuevoProyecto)
router
    .route('/')
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto)
router
    .route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)
// router.get('/tareas/:id', obtenerTareas)
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)

export default router