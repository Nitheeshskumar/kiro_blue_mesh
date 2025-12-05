"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../lib/database");
const router = (0, express_1.Router)();
// Helper function to verify JWT token
const verifyToken = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const db = await (0, database_1.getDatabase)();
    const user = await db.findUserById(decoded.userId);
    if (!user) {
        throw new Error('Invalid token');
    }
    return user;
};
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const db = await (0, database_1.getDatabase)();
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await db.createUser({
            email,
            password: hashedPassword,
            name,
            role: 'CUSTOMER'
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const db = await (0, database_1.getDatabase)();
        const user = await db.findUserByEmail(email);
        if (!user || !await bcryptjs_1.default.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
// Get current user
router.get('/me', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const db = await (0, database_1.getDatabase)();
        const customizationCount = await db.countCustomizations({ userId: user.id });
        const orderCount = await db.countOrders();
        const profile = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            _count: {
                orders: orderCount,
                customizations: customizationCount
            }
        };
        res.json(profile);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});
// Update profile
router.put('/profile', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const { name, email } = req.body;
        const db = await (0, database_1.getDatabase)();
        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await db.findUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Email already in use' });
            }
        }
        const updatedUser = await db.updateUser(user.id, {
            ...(name && { name }),
            ...(email && { email })
        });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Change password
router.put('/change-password', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }
        const db = await (0, database_1.getDatabase)();
        const userRecord = await db.findUserById(user.id);
        if (!userRecord || !await bcryptjs_1.default.compare(currentPassword, userRecord.password)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await db.updateUser(user.id, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.default = router;
