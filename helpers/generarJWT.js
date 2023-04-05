import jwt from 'jsonwebtoken'

const generarJWT = (id) => {
    // return jwt.sign({ nombre: "Adriano" }, process.env.JWT_SECRET, {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Vigencia del JWT
    })
}

export default generarJWT