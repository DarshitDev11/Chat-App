import jwt from 'jsonwebtoken';

export const verifyToken = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token) return res.status(401).send('you are not authanticated!');

    jwt.verify(token, process.env.JWT_KEY, (err,payload)=>{
        if(err) return res.status(403).send('token is not valid!');
        req.userId = payload.userId;
        next();
    });
};