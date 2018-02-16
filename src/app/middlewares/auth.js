const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) 
        return res.status(401).send({ error: 'No token provided' });

    const parts = authHeader.split(' ');

    if (parts === 2) 
        return res.status(401).send({ error: 'Token error' });

    const [scheme, token] = parts;

    //verify if it starts with Bearer
    if (!/^Bearer$/.test(scheme)) 
        return res.status(401).send({ error: 'Token malformatted' });

    jwt.verify(token, authConfig.secret, (err, decoded)=>{
        if (err) 
            return res.status(401).send({ error: 'Invavlid token' });
        
        req.userId = decoded.id;
        
        return next();
    });
};