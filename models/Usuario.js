import mongoose from "mongoose"
import bcrypt from "bcrypt"

// Creamos el schema
const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,     // Requediro
        trim: true,          // Borra los espacios del inicio y final
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,        // Unico
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false,     // Valor por defecto
    }
}, 
{
    timestamps: true,       // Created y Updated
})

usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next()          // Salta al siguiente middleware
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    // Comparar string no hasheado (no encriptado) con uno hasheadoo (encriptado)
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model('Usuario', usuarioSchema)
export default Usuario