import {} from 'express';
import jwt from 'jsonwebtoken';
import {} from '../types/index.js';
export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token, access denied' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};
export const adminOnly = (req, res, next) => {
    if (req.user?.userType !== 'admin') {
        res.status(403).json({ message: 'Admin access only' });
        return;
    }
    next();
};
//# sourceMappingURL=auth.js.map