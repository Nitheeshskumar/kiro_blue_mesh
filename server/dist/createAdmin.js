"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function createAdmin() {
    const email = 'admin@willowbrook.com';
    const password = 'admin123';
    const name = 'Admin User';
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', email);
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role:', admin.role);
        console.log('\n🔐 Please change the password after first login!');
    }
    catch (error) {
        console.error('❌ Failed to create admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdmin();
//# sourceMappingURL=createAdmin.js.map