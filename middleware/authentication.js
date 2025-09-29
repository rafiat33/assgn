exports.authenticate = async (req,res, next) =>{
    try{
        const auth = req.headers.authorization
        const token = auth.split('')[1]
        
       const decoded = jwt.verify(token.process.env.JWT_SECRET);

       const user = await userModel.findById(deecoded.id)
       if(!user){
        return res.status(404).json({
            message: "Authentication failed: User not found"
        })
       }
       //pass tthe payload to the request user
       req.user = decoded;

       next()
      }catch(error){
        if(error instanceof jwt.JsonTokenError){
        return res.status(500).json({
            message: "Session  expired, please login to continue"
        })
        }
        res.status(500).json({
            message:error.message
        })
    }
}