import express from "express"
// Importar el middleware checkAuth
import checkAuth from "../middleware/checkAuth.js"
// Importar el controllers
import { 
    /*usuarios, crearUsuarios*/ 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    perfil
} from "../controllers/usuarioController.js"

const router = express.Router()

// router.get('/', usuarios)
// router.post('/', crearUsuarios)

// Autenticación, Registro y Confirmación de Usuarios
router.post('/', registrar)     // Crea un nuevo usuario
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmar)
router.post('/olvide-password', olvidePassword)
// router.get('/olvide-password/:token', comprobarToken)
// router.post('/olvide-password/:token', nuevoPassword)
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)

export default router