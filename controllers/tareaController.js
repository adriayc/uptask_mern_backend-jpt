import mongoose from "mongoose"
// Importar models
import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

const agregarTarea = async (req, res) => {
    // console.log(req.body)
    const { proyecto } = req.body
    console.log(proyecto)
    // Validar el ID proyecto en moogose
    if (!mongoose.Types.ObjectId.isValid(proyecto)) {
        const error = new Error('ID proyecto invalido')
        return res.status(404).json({ msg: error.message })
    }

    const existeProyecto = await Proyecto.findById(proyecto)
    // console.log(existeProyecto)
    // Validar que el proyecto exista
    if (!existeProyecto) {
        const error = new Error('El Proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }

    // Validar que el creado del proyecto sea igual al usuario autenticado
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos para añadir tareas')
        return res.status(403).json({ msg: error.message })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)

        // Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)        // push modifica el array de origen
        await existeProyecto.save()

        return res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const obtenerTarea = async (req, res) => {
    const { id } = req.params
    // console.log(id)

    // const tarea = await Tarea.findById(id)
    const tarea = await Tarea.findById(id).populate('proyecto')     // Obtener tarea poblado con el proyecto
    // console.log(tarea)

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })     // 404 - cuando no se encuentra
    }

    // const { proyecto } = tarea

    // const existeProyecto = await Proyecto.findById(proyecto)
    // console.log(existeProyecto)

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })     // 403 - cuando no tiene permisos
    }

    return res.json(tarea)
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params
    // console.log(id)

    const tarea = await Tarea.findById(id).populate('proyecto')
    // console.log(tarea)

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    // Actualizar
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega
    tarea.prioridad = req.body.prioridad || tarea.prioridad

    try {
        const tareaAlmacenada = await tarea.save()
        return res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

}

const eliminarTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')
    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }
    // console.log(tarea)
    // console.log(tarea.proyecto._id)

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto._id)
        proyecto.tareas.pull(tarea._id)
        // await proyecto.save()

        // await tarea.deleteOne()

        // await Promise.all([await proyecto.save(), await tarea.deleteOne()])
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        return res.json({ msg: 'La Tarea se eliminó' })
    } catch (error) {
        console.log(error)
    }    
}

const cambiarEstado = async (req, res) => {
    // console.log(req.params.id)

    const { id } = req.params

    const tarea = await Tarea.findById(id)
        .populate('proyecto')
        // .populate('completado')          // Error, no muestra la tarea poblado por completado
    // console.log(tarea)

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && 
        !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    // console.log(tarea)
    // console.log(!tarea.estado)

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    // Para mostrar la tarea con el nombre de usuario que lo completo
    const tareaAlmacenada = await Tarea.findById(id)
        .populate('proyecto')
        .populate('completado')

    // console.log(tarea)           // Error, no muestra la tarea con el usuario completado poblado
    // console.log(tareaAlmacenada)

    // res.json(tarea)
    return res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}