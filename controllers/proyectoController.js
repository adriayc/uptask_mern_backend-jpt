import mongoose from "mongoose"
// Impotar modelos
import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {
    // Obtiene los proyectos del usuario autenticado
    // const proyectos = await Proyecto.find().where('creador').equals(req.usuario)
    // const proyectos = await Proyecto.find().where('creador').equals(req.usuario).select('-tareas')      // Excluye las tareas
    const proyectos = await Proyecto.find({
        '$or': [
            { colaboradores: { $in: req.usuario } },
            { creador: { $in: req.usuario } },
        ]
    })
        // .where('creador')
        // .equals(req.usuario)
        .select('-tareas')      // Excluye las tareas

    return res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    // console.log(req.body)
    // console.log(req.usuario)

    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        return res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params
    // console.log(id)
    // console.log(typeof id)
    // console.log(mongoose.Types.ObjectId.isValid(id))

    // Validar el ID en moogoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('ID proyecto invalido')
        return res.status(404).json({ msg: error.message })
    }

    // const proyecto = await Proyecto.findById(id)
    // const proyecto = await Proyecto.findById(id).populate('tareas')
    // const proyecto = await Proyecto.findById(id).populate('tareas').populate('colaboradores')
    // const proyecto = await Proyecto.findById(id).populate('tareas').populate('colaboradores', 'nombre email')       // Filtrar datos de consultas complejas
    const proyecto = await Proyecto.findById(id)
        // .populate('tareas')
        .populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre' } })        // Aplicar populate a un populate
        .populate('colaboradores', 'nombre email')       // Filtrar datos de consultas complejas
    // const proyecto = await Proyecto.findById(id).populate('tareas').populate('colaboradores')->select('-password')      // No funciona select (solo en consultas simples)
    // console.log(proyecto)

    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    // console.log(proyecto.creador)
    // console.log(req.usuario._id)
    // console.log(proyecto.creador.toString() === req.usuario._id.toString())   // convert ObjectId to string

    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    // Obtener las tareas del Proyecto
    // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)
    // proyecto.tareas = tareas    // Error!
    // const respuesta = { ...proyecto, ...tareas }

    return res.json(proyecto)
    // return res.json(respuesta)
    // return res.json({
    //     proyecto,
    //     tareas,
    // })
}

const editarProyecto = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId(id)) {
        const error = new Error('ID proyecto invalido')
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id)
    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        return res.json(proyectoAlmacenado)
    } catch(e) {
        console.log(e)
    }
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId(id)) {
        const error = new Error('ID proyecto invalido')
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id)
    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne()
        res.json({ msg: 'Proyecto eliminado' })
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) => {
    // console.log(req.body)

    const { email } = req.body
    // const usuario = await Usuario.findOne({email})
    const usuario = await Usuario.findOne({email}).select('-password -token -confirmado -createdAt -updatedAt -__v')

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    return res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    // console.log(req.params.id)

    const proyecto = await Proyecto.findById(req.params.id)
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    // Validar que el creador pueda agregar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    // console.log(req.body)

    const { email } = req.body
    const usuario = await Usuario.findOne({email}).select('-password -token -confirmado -createdAt -updatedAt -__v')

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    // El colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador')
        return res.status(404).json({ msg: error.message })
    }

    // Revisar que no este ya agregado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto')
        return res.status(404).json({ msg: error.message })
    }

    // Si todo esta OK, puede agregar al proyecto
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()

    return res.json({ msg: 'Colaborador agregado correctamente' })
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }

    // Esta bien, se puede eliminar
    proyecto.colaboradores.pull(req.body.id)
    // console.log(proyecto)
    // return
    await proyecto.save()

    return res.json({ msg: 'Colaborador Eliminado Correctamente' })
}

// const obtenerTareas = async (req, res) => {
//     const { id } = req.params

//     const existeProyecto = await Proyecto.findById(id)
//     if (!existeProyecto) {
//         const error = new Error('Proyecto no encontrado')
//         return res.status(404).json({ msg: error.message })
//     }

//     // Tienes que ser creador del proyecto o colaborador
//     const tareas = await Tarea.find().where('proyecto').equals(id)
//     return res.json(tareas)
// }

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
    // obtenerTareas,
}