import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
    const email = 'admin@willowbrook.com'
    const password = 'admin123'
    const name = 'Admin User'

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        })

        if (existingAdmin) {
            console.log('Admin user already exists!')
            console.log('Email:', email)
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN'
            }
        })

        console.log('✅ Admin user created successfully!')
        console.log('Email:', email)
        console.log('Password:', password)
        console.log('Role:', admin.role)
        console.log('\n🔐 Please change the password after first login!')

    } catch (error) {
        console.error('❌ Failed to create admin user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAdmin()