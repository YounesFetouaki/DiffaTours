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

const imageUpdates = [
  {
    id: 'marrakech-zagora-2-jours',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/majestic-moroccan-desert-landscape-with--e4c47553-20251130192458.jpg']
  },
  {
    id: 'palmeraie-marrakech',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/beautiful-marrakech-palmeraie-palm-grove-454fb165-20251130192457.jpg']
  },
  {
    id: 'essaouira',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/essaouira-coastal-town-morocco-white-bui-f258c6c6-20251130192458.jpg']
  },
  {
    id: 'chez-ali-fantasia',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/spectacular-moroccan-fantasia-show-at-ni-5fe8c4e6-20251130192458.jpg']
  },
  {
    id: 'ouarzazate-ait-ben-haddou',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/ancient-ait-ben-haddou-kasbah-fortress-m-360b8f70-20251130192458.jpg']
  },
  {
    id: 'vallee-ourika-marche-berbere',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/ourika-valley-morocco-with-traditional-b-c6645420-20251130192457.jpg']
  },
  {
    id: 'cascades-ouzoud',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/magnificent-ouzoud-waterfalls-morocco-ca-e4e2efdb-20251130192457.jpg']
  },
  {
    id: 'jardins-majorelle-menara',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/stunning-jardin-majorelle-marrakech-with-d81e6125-20251130192457.jpg']
  },
  {
    id: 'les-3-vallees',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/three-valleys-morocco-mountain-landscape-9148a6ad-20251130192458.jpg']
  },
  {
    id: 'jemaa-el-fna',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/bustling-jemaa-el-fna-square-marrakech-a-6dcc9f2d-20251130192601.jpg']
  },
  {
    id: 'visite-guidee-medina',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/marrakech-medina-souk-with-traditional-c-69cd7a12-20251130192457.jpg']
  },
  {
    id: 'quad-marrakech',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/exciting-quad-bike-adventure-in-moroccan-63a704b0-20251130192457.jpg']
  }
];

async function updateMarrakechImages() {
  try {
    console.log('🖼️  Starting image updates for Marrakech excursions...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    let updateCount = 0;
    
    for (const update of imageUpdates) {
      const result = await Excursion.updateOne(
        { id: update.id },
        { $set: { images: update.images } }
      );
      
      if (result.modifiedCount > 0) {
        updateCount++;
        console.log(`✅ Updated images for: ${update.id}`);
      } else {
        console.log(`⚠️  No excursion found with id: ${update.id}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} out of ${imageUpdates.length} excursions!`);
    
    // Verify the updates
    console.log('\n📋 Verifying updates...');
    const updatedExcursions = await Excursion.find({ section: 'marrakech' }).select('id name images');
    updatedExcursions.forEach((exc) => {
      console.log(`   ✓ ${exc.name}: ${exc.images[0] ? '✅ Has image' : '❌ No image'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update error:', error);
    process.exit(1);
  }
}

updateMarrakechImages();
