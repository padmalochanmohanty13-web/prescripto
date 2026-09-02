import jwt from 'jsonwebtoken'


// Doctor authentication MIDDLEWARE

const authDoctor = async (req,res,next) => {
    try {

        const dtoken = req.headers.dtoken || req.headers.dToken
        if (!dtoken) {
            return res.json({success:false,message:"not authorized login again"})
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        req.docId = token_decode.id
       
        next()
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

export default authDoctor