// Load environment variables BEFORE any imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Now import after env is loaded
import { connectDB } from '../src/lib/mongodb.js';
import { Excursion } from '../src/models/Excursion.js';

const marrakechExcursions = [
  {
    id: 'marrakech-zagora-2-jours',
    name: 'Marrakech Zagora (2 jours)',
    description: 'Départ de Marrakech à 07h00 du matin, via col Tichka 2260m, visite du Kasbah Ait Benhaddou, Ouarzazate. Traversée de la vallée de Dràa pour atteindre Zagora. 01h30 de ballade en dromadaires pour atteindre le bivouac et admirer le coucher du soleil. Nuit en bivouac. Jour 2: Zagora – Marrakech via Agdz, Ouarzazate, déjeuner à Ouarzazate et retour par le col Tichka.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/ba2eec0e-45ab-473d-9697-4c2368385b9a.jpg'],
    priceMAD: 900,
    duration: '2 jours',
    location: 'Zagora',
    section: 'marrakech',
    groupSize: '2-50',
    highlights: ['Col Tichka 2260m', 'Kasbah Ait Benhaddou', 'Vallée de Dràa', 'Balade en dromadaires', 'Coucher de soleil', 'Bivouac'],
    included: ['Transport', 'Hébergement en bivouac avec dîner et petit déjeuner', 'Balade en dromadaire'],
    notIncluded: ['Boissons', 'Repas de midi'],
    rating: 4.8,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'palmeraie-marrakech',
    name: 'Palmeraie Marrakech',
    description: 'Vous traverserez la palmeraie pour une balade dure environ 1h30 et un goûter vous sera servi dans une maison traditionnelle. Vous serez vêtus de la tenue traditionnelle. Thé chez l\'habitant, village en pisé, une excellente visite de la partie la plus sauvage de la palmeraie.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/e02f6d2f-19c9-486e-8ec3-bd55efe72e62.jpg'],
    priceMAD: 350,
    duration: '1h30',
    location: 'Palmeraie Marrakech',
    section: 'marrakech',
    groupSize: '2-30',
    highlights: ['Balade en palmeraie', 'Goûter traditionnel', 'Tenue traditionnelle', 'Thé chez l\'habitant', 'Village en pisé'],
    included: ['Transport', 'Goûter', 'Thé'],
    notIncluded: ['Boissons supplémentaires'],
    rating: 4.6,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'essaouira',
    name: 'Essaouira',
    description: 'Ville fortifiée à l\'étonnant mélange d\'architecture, Essaouira a attiré de tout temps les voyageurs de passage. Durant cette excursion, vous serez séduit par le port animé de chalutiers multicolores déversant leur cargaison de sardines, par la médina avec ses ruelles bordées de maisons blanches aux volets bleus et par la douceur de vivre caractéristique des villes côtières. La région productrice de l\'huile d\'argon.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/8535ad02-29fa-4cb0-a99f-40dc73f57fe4.jpg'],
    priceMAD: 450,
    duration: 'Journée complète',
    location: 'Essaouira',
    section: 'marrakech',
    groupSize: '2-50',
    highlights: ['Port animé', 'Médina historique', 'Maisons blanches aux volets bleus', 'Huile d\'argan'],
    included: ['Transport', 'Guide'],
    notIncluded: ['Déjeuner', 'Boissons'],
    rating: 4.7,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'chez-ali-fantasia',
    name: 'Chez Ali (Fantasia)',
    description: 'Dans un cadre digne des milles et une nuit, une soirée inoubliable. Pendant votre dîner marocain pris dans un décor bédouin luxueux, vous assisterez aux défilés des différentes troupes folkloriques du Maroc. Après le spectacle vous serez invité à découvrir ce qui a rendu cet endroit si célèbre dans le monde entier: la fantasia. Un programme complet où se mélangent acrobaties, danses du ventre, gnawas et tapis volant.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/2d2c7f05-bf37-4a12-b81a-6bbf5d4a86a3.jpg'],
    priceMAD: 650,
    duration: '4 heures',
    location: 'Chez Ali, Marrakech',
    section: 'marrakech',
    groupSize: '2-200',
    highlights: ['Dîner marocain', 'Décor bédouin', 'Spectacle folklorique', 'Fantasia', 'Danses du ventre', 'Gnawas', 'Acrobaties'],
    included: ['Dîner', 'Spectacle', 'Transport'],
    notIncluded: ['Boissons', 'Pourboires'],
    rating: 4.9,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'ouarzazate-ait-ben-haddou',
    name: 'Ouarzazate Ait Ben Haddou',
    description: 'Vous traversez l\'une des plus belle routes du Maroc, la route de Ouarzazate est une phase incontournable pour sa luminosité et le contraste du paysage. Visite de la kasbah de Telouet, ancienne résidence du Glaoui, dernier seigneur de l\'atlas. Déjeuner dans la plus belle kasbah du sud marocain. Restauré par l\'UNESCO qui l\'a classé patrimoine mondial, Ait Ben Haddou ressemble à un village médiéval de terre rouge qui aurait traversé le temps.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/cba03ccd-0e77-4e60-97fa-0f6adea65e52.jpg'],
    priceMAD: 550,
    duration: 'Journée complète',
    location: 'Ouarzazate',
    section: 'marrakech',
    groupSize: '2-50',
    highlights: ['Route de Ouarzazate', 'Kasbah de Telouet', 'Ait Ben Haddou UNESCO', 'Déjeuner dans une kasbah'],
    included: ['Transport', 'Déjeuner', 'Guide'],
    notIncluded: ['Boissons'],
    rating: 4.8,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'vallee-ourika-marche-berbere',
    name: 'Vallée de l\'Ourika (Marché Berbère)',
    description: 'Une immersion dans le monde rurale de la Vallée de l\'Ourika. Partez à la rencontre des charmes et accueil des locaux de la vallée. Une visite guidée d\'un marché berbère, un arrêt dans maison typique de la région. Découvrez les uses et coutumes du quotidien des habitants. Cette matinée accessible au grand public et facile pour les familles. Une réelle rencontre qui vous donnera un sens de votre voyage au Maroc.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/5d3d58fb-4e23-4cd9-861f-7d47b30d87dc.jpg'],
    priceMAD: 280,
    duration: 'Demi-journée',
    location: 'Vallée de l\'Ourika',
    section: 'marrakech',
    groupSize: '2-40',
    highlights: ['Marché berbère', 'Maison typique', 'Culture locale', 'Accessible aux familles'],
    included: ['Transport', 'Guide'],
    notIncluded: ['Déjeuner', 'Boissons'],
    rating: 4.5,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'cascades-ouzoud',
    name: 'Cascades d\'Ouzoud',
    description: 'L\'un des plus beaux sites du moyen atlas, d\'une hauteur de plus de 100m, l\'Ouzoud se précipite au fond d\'un gouffre verdoyant tapissé de concrétions calcaires et de plantes grimpantes. Le rebond de l\'eau sur les rochers provoque un brouillard donnant naissance à un arc-en-ciel quasi permanent. Le grondement de la chute, le bouillonnement des eaux, l\'exubérance de la végétation, concourent à composer un spectacle puissant et romantique.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/d9ba8a21-8f15-4c49-a2ea-4dd0f8e33932.jpg'],
    priceMAD: 400,
    duration: 'Journée complète',
    location: 'Cascades d\'Ouzoud',
    section: 'marrakech',
    groupSize: '2-50',
    highlights: ['Cascade 100m', 'Arc-en-ciel permanent', 'Verdure exubérante', 'Moyen Atlas'],
    included: ['Transport', 'Guide'],
    notIncluded: ['Déjeuner', 'Boissons'],
    rating: 4.7,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'jardins-majorelle-menara',
    name: 'Jardins Majorelle & Menara',
    description: 'Vous débuterez votre visite par les merveilleux jardins Majorelle (demeure du peintre Majorelle et du célèbre couturier Yves St Laurent), un véritable havre de paix et de verdure. Visite du bassin de la MENARA. Une balade longeant une partie des remparts de la ville (12ème siècle), la traversée d\'une partie de la palmeraie.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/0bdb6a3e-9ac2-4b75-8c0d-d70ad8a15e8e.jpg'],
    priceMAD: 320,
    duration: 'Demi-journée',
    location: 'Marrakech',
    section: 'marrakech',
    groupSize: '2-40',
    highlights: ['Jardins Majorelle', 'Yves Saint Laurent', 'Bassin Menara', 'Remparts 12ème siècle', 'Palmeraie'],
    included: ['Transport', 'Entrées', 'Guide'],
    notIncluded: ['Boissons'],
    rating: 4.8,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'les-3-vallees',
    name: 'Les 3 Vallées',
    description: 'Un parcours par une route de montagne entre 800 et 1.000 mètres d\'altitude, les couleurs des paysages variant entre le rouge, le mauve, le noir et le vert... des petites cultures sur terrassement parsemées de charmants petits villages adossés à la montagne. Les trois vallées, Ourika – Asni – Ouirgane (164 kms parcours en boucle). De multiples arrêts, une sensation unique de vivre la vie de tous les jours au pays du peuple berbère.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/d318ead4-fd55-46d3-b4e2-43ea23b0e89d.jpg'],
    priceMAD: 480,
    duration: 'Journée complète',
    location: 'Ourika, Asni, Ouirgane',
    section: 'marrakech',
    groupSize: '2-50',
    highlights: ['Route de montagne 800-1000m', 'Paysages variés', 'Villages berbères', '164km en boucle'],
    included: ['Transport', 'Guide'],
    notIncluded: ['Déjeuner', 'Boissons'],
    rating: 4.6,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'jemaa-el-fna',
    name: 'Jemaa El Fna',
    description: 'Jamaâ El Fna est la principale attraction touristique de Marrakech. Véritable "cour des miracles", elle est animée d\'une vie intense où le misérable et le sublime se mêlent pour offrir un spectacle hallucinant. Badauds, musiciens, boutiquiers, danseurs, charmeurs de serpents, mendiants, guérisseurs... forment une foule hétéroclite et bigarrée. A la nuit tombée, les gargotiers s\'installent et la place se métamorphose alors en un vaste restaurant en plein air.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/75baad46-3b57-45e1-82b3-11e61a6b2c35.jpg'],
    priceMAD: 150,
    duration: '2-3 heures',
    location: 'Jemaa El Fna, Marrakech',
    section: 'marrakech',
    groupSize: '2-30',
    highlights: ['Place mythique', 'Charmeurs de serpents', 'Musiciens', 'Danseurs', 'Restaurant en plein air'],
    included: ['Guide'],
    notIncluded: ['Nourriture', 'Boissons'],
    rating: 4.5,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'visite-guidee-medina',
    name: 'Visite Guidée Médina',
    description: 'Une matinée pour découvrir la médina de Marrakech, la ville impériale. La Koutoubia. Le patrimoine culturel et architectural vous aidera à comprendre la destination. Son passé, son présent. Visite guidée des souks artisanaux en terminant par la place mythique, Jema El Fnaa. Une immersion guidée facile et accessible à tout public.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/3f7a8fb4-1e24-482b-a4b4-3f13de46a4a0.jpg'],
    priceMAD: 250,
    duration: 'Demi-journée',
    location: 'Médina Marrakech',
    section: 'marrakech',
    groupSize: '2-30',
    highlights: ['Koutoubia', 'Souks artisanaux', 'Jemaa El Fna', 'Patrimoine culturel', 'Accessible à tous'],
    included: ['Guide'],
    notIncluded: ['Achats', 'Boissons'],
    rating: 4.6,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  },
  {
    id: 'quad-marrakech',
    name: 'Quad à Marrakech',
    description: 'Une autre façon de découvrir les paysages et les villages retirés aux alentours de Marrakech. Au départ de l\'hôtel, direction la route de la vallée de l\'ourikae, d\'où vous partirez pour une ballade d\'une durée d\'environ 2 heures. Un goûter vous sera servi chez le berbère. Vous serez ensuite ramenés à l\'hôtel. Aucun permis n\'est nécessaire. Le passager doit avoir 10 ans révolus.',
    images: ['https://orchids-ai-assets.s3.us-east-1.amazonaws.com/user-ek6UyLBdXHVeKqVWdL2PoqacdXB3/6b27cc39-1e43-4e2e-bc4a-4c00dcb1d97d.jpg'],
    priceMAD: 450,
    duration: '2 heures',
    location: 'Vallée de l\'Ourika',
    section: 'marrakech',
    groupSize: '2-30',
    highlights: ['Balade en quad', 'Paysages', 'Villages berbères', 'Goûter chez l\'habitant', 'Sans permis'],
    included: ['Quad', 'Guide', 'Goûter', 'Transport'],
    notIncluded: ['Boissons'],
    rating: 4.7,
    ageGroups: true,
    items: [{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]
  }
];

async function seedMarrakechExcursions() {
  try {
    console.log('🌱 Starting Marrakech excursions seeding...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if excursions already exist
    const existingCount = await Excursion.countDocuments({ section: 'marrakech' });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing Marrakech excursions`);
      console.log('🗑️  Deleting existing Marrakech excursions...');
      await Excursion.deleteMany({ section: 'marrakech' });
      console.log('✅ Deleted existing excursions');
    }

    // Insert new excursions
    console.log('📝 Inserting 12 Marrakech excursions...');
    const result = await Excursion.insertMany(marrakechExcursions);
    
    console.log(`✅ Successfully seeded ${result.length} Marrakech excursions!`);
    console.log('\n📋 Seeded excursions:');
    result.forEach((exc, index) => {
      console.log(`   ${index + 1}. ${exc.name} (${exc.id}) - ${exc.priceMAD} MAD`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedMarrakechExcursions();