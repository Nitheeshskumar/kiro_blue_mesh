import { BrandStory } from '../types/brandStory.types';

export const brandStoryData: BrandStory = {
  hero: {
    title: "Crafting Stories Through Fabric",
    subtitle: "Since 2018, Willowbrook has been dedicated to creating premium custom clothing that celebrates individuality and craftsmanship. Every piece tells a story - yours.",
    backgroundImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  timeline: [
    {
      id: "1",
      year: 2018,
      title: "The Beginning",
      description: "Founded by Banu in her home studio with a vision to make custom clothing accessible to everyone.",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: true
    },
    {
      id: "2",
      year: 2019,
      title: "First Collection Launch",
      description: "Launched our signature cotton essentials line, focusing on comfort and sustainability.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: false
    },
    {
      id: "3",
      year: 2020,
      title: "Digital Innovation",
      description: "Introduced 3D customization technology, allowing customers to visualize their designs in real-time.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: true
    },
    {
      id: "4",
      year: 2021,
      title: "Sustainable Practices",
      description: "Achieved carbon-neutral shipping and introduced our organic cotton certification program.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: false
    },
    {
      id: "5",
      year: 2022,
      title: "Community Growth",
      description: "Reached 10,000 happy customers and launched our customer photo sharing program.",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: false
    },
    {
      id: "6",
      year: 2023,
      title: "Premium Experience",
      description: "Launched our premium UI and enhanced customization studio with advanced measurement tools.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      milestone: true
    }
  ],
  values: [
    {
      id: "1",
      title: "Quality Craftsmanship",
      description: "Every piece is meticulously crafted with attention to detail and premium materials.",
      icon: "✨",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2",
      title: "Sustainable Fashion",
      description: "We're committed to environmentally responsible practices and ethical manufacturing.",
      icon: "🌱",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      title: "Personal Expression",
      description: "Your style is unique. Our customization tools help you express your individuality.",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "4",
      title: "Customer First",
      description: "Your satisfaction drives everything we do, from design to delivery.",
      icon: "❤️",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ],
  team: [
    {
      id: "1",
      name: "Banu Nazir Maheen",
      role: "Founder & Creative Director",
      bio: "With over 15 years in fashion design, Banu founded Willowbrook to democratize custom clothing. She believes everyone deserves clothing that fits perfectly and reflects their personality.",
      image: "https://frbdhevxgofuvnrcbcvi.supabase.co/storage/v1/object/public/user-avatars/banu_brand.jpg",
      isFounder: true
    },
    // {
    //   id: "2",
    //   name: "Marcus Rodriguez",
    //   role: "Head of Technology",
    //   bio: "Marcus leads our innovation in 3D visualization and customization technology, making the impossible possible in digital fashion.",
    //   image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    //   isFounder: false
    // },
    // {
    //   id: "3",
    //   name: "Emma Thompson",
    //   role: "Sustainability Director",
    //   bio: "Emma ensures our commitment to environmental responsibility while maintaining the highest quality standards in our manufacturing processes.",
    //   image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    //   isFounder: false
    // }
  ],
  sustainability: {
    title: "Our Commitment to the Planet",
    description: "We believe fashion should be beautiful, not just for you, but for the world. Our sustainability initiatives ensure that every piece we create contributes to a better future.",
    commitments: [
      {
        id: "1",
        title: "Carbon Neutral Shipping",
        description: "All orders are shipped with carbon-neutral delivery methods.",
        icon: "🚚",
        progress: 100
      },
      {
        id: "2",
        title: "Organic Materials",
        description: "85% of our fabrics are certified organic or sustainably sourced.",
        icon: "🌿",
        progress: 85
      },
      {
        id: "3",
        title: "Waste Reduction",
        description: "Zero textile waste through our circular design process.",
        icon: "♻️",
        progress: 95
      },
      {
        id: "4",
        title: "Fair Trade",
        description: "All manufacturing partners meet fair trade standards.",
        icon: "🤝",
        progress: 100
      }
    ],
    certifications: [
      {
        id: "1",
        name: "GOTS Certified",
        description: "Global Organic Textile Standard certification for organic fibers.",
        logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
      },
      {
        id: "2",
        name: "B Corp Certified",
        description: "Certified B Corporation meeting highest standards of social and environmental performance.",
        logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
      }
    ]
  }
};