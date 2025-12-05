"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Create sample products
    const products = [
        {
            id: 'prod_tshirt_classic',
            name: 'Classic T-Shirt',
            description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
            category: 'shirts',
            basePrice: 2075.00, // ₹2,075 (25 USD * 83)
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF']
        },
        {
            id: 'prod_hoodie_premium',
            name: 'Premium Hoodie',
            description: 'Cozy fleece hoodie with kangaroo pocket and adjustable drawstring',
            category: 'hoodies',
            basePrice: 3735.00, // ₹3,735 (45 USD * 83)
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#808080', '#FF0000', '#0000FF', '#008000']
        },
        {
            id: 'prod_polo_business',
            name: 'Business Polo',
            description: 'Professional polo shirt ideal for business casual settings',
            category: 'shirts',
            basePrice: 2905.00, // ₹2,905 (35 USD * 83)
            images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop&crop=center'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000080', '#FFFFFF', '#000000', '#800000', '#008000']
        },
        {
            id: 'prod_tank_athletic',
            name: 'Athletic Tank Top',
            description: 'Moisture-wicking tank top perfect for workouts and sports',
            category: 'activewear',
            basePrice: 1660.00, // ₹1,660 (20 USD * 83)
            images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&crop=center'],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['#FF4500', '#000000', '#FFFFFF', '#0000FF', '#FF0000']
        },
        {
            id: 'prod_sweatshirt_crew',
            name: 'Crew Neck Sweatshirt',
            description: 'Classic crew neck sweatshirt made from soft cotton blend',
            category: 'sweatshirts',
            basePrice: 3320.00, // ₹3,320 (40 USD * 83)
            images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#708090', '#000000', '#FFFFFF', '#800000', '#000080']
        },
        {
            id: 'prod_longsleeve_basic',
            name: 'Long Sleeve Basic',
            description: 'Essential long sleeve shirt for layering or standalone wear',
            category: 'shirts',
            basePrice: 2490.00, // ₹2,490 (30 USD * 83)
            images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&crop=center'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#2F4F4F', '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#008000']
        }
    ];
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: product,
            create: product
        });
        console.log(`Created/updated product: ${product.name}`);
    }
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map