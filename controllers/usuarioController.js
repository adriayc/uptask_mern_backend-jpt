// Importar models
import Usuario from "../models/Usuario.js"
// Importar helpers
import generarId from "../helpers/generarId.js"
import generarJWT from "../helpers/generarJWT.js"
import { emailResgistro, emailOlvidePassword } from "../helpers/email.js"

// // GET
// const usuarios = (req, res) => {
//     // res.send('Desde GET - API/USUARIOS')
//     res.json({ msg: 'Desde GET - API/USUARIOS' })
// }

// // POST
// const crearUsuarios = (req, res) => {
//     res.json({ msg: 'Creando usuario' })
// }

// POST (Registrar Usuario)
const registrar = async (req, res) => {
    // console.log(req)
    // console.log(req.body)

    // Evitar registros duplicados
    const { email } = req.body
    // const existeUsuario = await Usuario.findOne({ email: email })
    const existeUsuario = await Usuario.findOne({ email })
    // console.log(existeUsuario)

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const usuario = new Usuario(req.body)
        // console.log(usuario)
        usuario.token = generarId()
        // const usuarioAlmacenado = await usuario.save()
        await usuario.save()

        // Enviar el mail de confirmacion
        // console.log(usuario)
        emailResgistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        // res.json({ msg: 'Creando Usuario' })
        // res.json(usuarioAlmacenado)
        return res.json({ msg: 'Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta' })
        
    } catch (error) {
        console.log(error)
    }
}

// POST (Autenticar Usuario)
const autenticar = async (req, res) => {
    const { email, password } = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email })
    // console.log(usuario)
    if (!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({ msg: error.message })
    }

    // Comprobar si el usuario esta confirmado
    // console.log(usuario)
    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmado')
        return res.status(403).json({ msg: error.message })
    }

    // Comprobar su password
    if (await usuario.comprobarPassword(password)) {
        // console.log('Es correcto')
        res.json({
            // usuario     // No es correcto devolver toda la informacion del usuario

            // Devolvemos los datos necesarios
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        // console.log('Es incorrecto')
        const error = new Error('El password es incorrecto')
        return res.status(403).json({ msg: error.message })
    }
}

// GET (Confirmar cuenta via TOKEN)
const confirmar = async (req, res) => {
    // console.log('Routing dinamico')
    // console.log(req.params)
    // console.log(req.params.token)       // Obtene el valor del params URL
    
    const { token } = req.params

    const usuarioConfirmar = await Usuario.findOne({ token })
    // console.log(usuarioConfirmar)
    if (!usuarioConfirmar) {
        const error = new Error('Token no válido')
        return res.status(403).json({ msg: error.message })
    }

    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ''     // Token de un solo uso (Eliminamos el token)
        await usuarioConfirmar.save()
        return res.json({ msg: 'Usuario confirmado correctamente' })
        // console.log(usuarioConfirmar)
    } catch (error) {
        console.log(error)
    }
}

// POST (Reestablecer un nuevo password)
const olvidePassword = async (req, res) => {
    const { email } = req.body

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    try {
        usuario.token = generarId()
        // console.log(usuario)
        await usuario.save()

        // Enviar el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        return res.json({ msg: 'Hemos enviado un email con las intrucciones' })
    } catch (error) {
        console.log(error)
    }
}

// GET (Comprobar Token para el nuevo password)
const comprobarToken = async (req, res) => {
    const { token } = req.params
    // console.log(token);

    const tokenValido = await Usuario.findOne({ token })
    if (tokenValido) {
        // console.log('Token valido')
        res.json({ msg: 'Token válido y el Usuario existe' })
    } else {
        // console.log('Token no valido')
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })   
    }
}

// POST (Almacena el nuevo password)
const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    // console.log(token)
    // console.log(password)

    const usuario = await Usuario.findOne({ token })
    if (usuario) {
        // console.log(usuario)
        usuario.password = password
        usuario.token = ''

        try {
            await usuario.save()
            res.json({ msg: 'Password modificado correctamente' })
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Token no válido');
        return res.status(404).json({ msg: error.message })
    }
}

// GET (Perfil del usuario autenticado)
const perfil = async (req, res) => {
    // console.log('Desde perfil...')
    const { usuario } = req
    // console.log(usuario)

    // return res.json(usuario)
    res.json(usuario)
}

export {
    // usuarios,
    // crearUsuarios,

    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}