/**
 * Database Seeder — PhinTech Smart Bookstore
 * Seeds books and promotes admin user.
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://phingish_db_user:vD4X0owITL4TZhc4@cluster0.zbemv21.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0';

const books = [
  {
    title:       'Things Fall Apart',
    author:      'Chinua Achebe',
    genre:       'African Literature',
    price:       1200,
    stock:       50,
    isbn:        '978-0-385-47454-2',
    description: 'A landmark novel of African literature. Set in pre-colonial Nigeria, it follows Okonkwo, a proud Igbo warrior, as his world is disrupted by the arrival of European missionaries.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780385474542-L.jpg',
  },
  {
    title:       'Weep Not, Child',
    author:      'Ngũgĩ wa Thiong\'o',
    genre:       'African Literature',
    price:       950,
    stock:       40,
    isbn:        '978-0-14-018776-2',
    description: 'The first novel in English by an East African author. A powerful story of a Kenyan family caught up in the Mau Mau uprising against British colonial rule.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780140187762-L.jpg',
  },
  {
    title:       'A Grain of Wheat',
    author:      'Ngũgĩ wa Thiong\'o',
    genre:       'African Literature',
    price:       1100,
    stock:       35,
    isbn:        '978-0-14-018774-8',
    description: 'Set in the days leading up to Kenyan independence, this novel explores themes of betrayal, sacrifice, and the complexity of the freedom struggle.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780140187748-L.jpg',
  },
  {
    title:       'Purple Hibiscus',
    author:      'Chimamanda Ngozi Adichie',
    genre:       'African Literature',
    price:       1350,
    stock:       45,
    isbn:        '978-1-61620-028-7',
    description: 'A coming-of-age story set in post-colonial Nigeria, exploring family, faith, and freedom through the eyes of fifteen-year-old Kambili.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9781616200282-L.jpg',
  },
  {
    title:       'Half of a Yellow Sun',
    author:      'Chimamanda Ngozi Adichie',
    genre:       'Historical Fiction',
    price:       1500,
    stock:       30,
    isbn:        '978-1-4000-9537-2',
    description: 'Set during the Nigerian Civil War, this novel follows three characters whose lives intersect during one of Africa\'s most devastating conflicts.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9781400095377-L.jpg',
  },
  {
    title:       'The River and the Source',
    author:      'Margaret A. Ogola',
    genre:       'African Literature',
    price:       1050,
    stock:       55,
    isbn:        '978-9966-46-830-5',
    description: 'A sweeping saga of four generations of Kenyan women, from the pre-colonial era to modern times. Winner of the Commonwealth Writers Prize.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9789966468305-L.jpg',
  },
  {
    title:       'Petals of Blood',
    author:      'Ngũgĩ wa Thiong\'o',
    genre:       'African Literature',
    price:       1200,
    stock:       25,
    isbn:        '978-0-14-300387-4',
    description: 'A powerful indictment of post-independence Kenya, following four characters whose lives converge in a murder investigation in a small town.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780143003878-L.jpg',
  },
  {
    title:       'Americanah',
    author:      'Chimamanda Ngozi Adichie',
    genre:       'Contemporary Fiction',
    price:       1400,
    stock:       40,
    isbn:        '978-0-307-45597-3',
    description: 'A story of love and identity following a young Nigerian woman who emigrates to America, exploring race, belonging, and the immigrant experience.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780307455970-L.jpg',
  },
  {
    title:       'The Famished Road',
    author:      'Ben Okri',
    genre:       'Magical Realism',
    price:       1300,
    stock:       20,
    isbn:        '978-0-385-42476-9',
    description: 'Booker Prize winner. The story of Azaro, a spirit child who chooses to stay in the land of the living, set against the backdrop of a newly independent African nation.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780385424769-L.jpg',
  },
  {
    title:       'So Long a Letter',
    author:      'Mariama Bâ',
    genre:       'African Literature',
    price:       900,
    stock:       35,
    isbn:        '978-0-435-90530-1',
    description: 'A landmark feminist novel from Senegal, written as a letter from a recently widowed woman to her friend, exploring the lives of women in Senegalese society.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780435905309-L.jpg',
  },
  {
    title:       'Business Adventures',
    author:      'John Brooks',
    genre:       'Business',
    price:       1800,
    stock:       30,
    isbn:        '978-1-4976-2645-4',
    description: 'Bill Gates\' favourite business book. Twelve classic tales from the world of Wall Street that remain as relevant today as when they were first written.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9781497626454-L.jpg',
  },
  {
    title:       'The Lean Startup',
    author:      'Eric Ries',
    genre:       'Business',
    price:       2000,
    stock:       45,
    isbn:        '978-0-307-88791-7',
    description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses. Essential reading for any startup founder.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780307887917-L.jpg',
  },
  {
    title:       'Rich Dad Poor Dad',
    author:      'Robert T. Kiyosaki',
    genre:       'Personal Finance',
    price:       1600,
    stock:       60,
    isbn:        '978-1-61268-116-2',
    description: 'What the rich teach their kids about money that the poor and middle class do not. A personal finance classic that has changed millions of lives.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9781612681160-L.jpg',
  },
  {
    title:       'Atomic Habits',
    author:      'James Clear',
    genre:       'Self Development',
    price:       1900,
    stock:       50,
    isbn:        '978-0-7352-1129-2',
    description: 'An easy and proven way to build good habits and break bad ones. The most comprehensive guide on how tiny changes can lead to remarkable results.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
  },
  {
    title:       'The Alchemist',
    author:      'Paulo Coelho',
    genre:       'Fiction',
    price:       1100,
    stock:       70,
    isbn:        '978-0-06-231500-7',
    description: 'A magical story about following your dreams. Santiago, an Andalusian shepherd boy, travels from Spain to Egypt in search of treasure and discovers the meaning of life.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
  },
  {
    title:       'Clean Code',
    author:      'Robert C. Martin',
    genre:       'Technology',
    price:       3500,
    stock:       25,
    isbn:        '978-0-13-235088-4',
    description: 'A handbook of agile software craftsmanship. Essential reading for every software developer who wants to write better, more maintainable code.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
  },
  {
    title:       'The Pragmatic Programmer',
    author:      'David Thomas & Andrew Hunt',
    genre:       'Technology',
    price:       3200,
    stock:       20,
    isbn:        '978-0-13-595705-9',
    description: 'Your journey to mastery. From journeyman to master — a collection of tips and best practices for software developers at every level.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
  },
  {
    title:       'Sapiens: A Brief History of Humankind',
    author:      'Yuval Noah Harari',
    genre:       'History',
    price:       2200,
    stock:       40,
    isbn:        '978-0-06-231609-7',
    description: 'A groundbreaking narrative of humanity\'s creation and evolution. Explores how biology and history have defined us and enhanced our understanding of what it means to be human.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
  },
  {
    title:       'Think and Grow Rich',
    author:      'Napoleon Hill',
    genre:       'Personal Finance',
    price:       1200,
    stock:       55,
    isbn:        '978-1-58542-433-4',
    description: 'The classic guide to financial success. Based on interviews with over 500 of America\'s most successful people, this book reveals the secrets to achieving wealth.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
  },
  {
    title:       'The 48 Laws of Power',
    author:      'Robert Greene',
    genre:       'Self Development',
    price:       2500,
    stock:       30,
    isbn:        '978-0-14-028019-7',
    description: 'Amoral, cunning, ruthless, and instructive, this multi-million-copy New York Times bestseller is the definitive manual for anyone interested in gaining, observing, or defending against ultimate control.',
    imageUrl:    'https://covers.openlibrary.org/b/isbn/9780140280197-L.jpg',
  },
];

async function seed() {
  console.log('\n🌱 PhinTech Smart Bookstore — Database Seeder\n');

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB Atlas\n');

  const Book = require('./models/Book');
  const User = require('./models/User');
  const License = require('./models/License');

  // ── Seed books ──────────────────────────────────────────────
  console.log('📚 Seeding books...');
  let added = 0, skipped = 0;
  for (const book of books) {
    const exists = await Book.findOne({ isbn: book.isbn });
    if (!exists) {
      await Book.create(book);
      console.log(`   + ${book.title} — KES ${book.price.toLocaleString('en-KE')}`);
      added++;
    } else {
      skipped++;
    }
  }
  console.log(`\n   Added: ${added} | Skipped (already exist): ${skipped}`);

  // ── Promote admin user ───────────────────────────────────────
  console.log('\n👤 Promoting admin user...');
  const adminEmail = 'admin@phintechsolutions.com';
  const admin = await User.findOne({ email: adminEmail });

  if (admin) {
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(`   ✅ ${admin.name} (${adminEmail}) promoted to admin`);
    } else {
      console.log(`   ✅ ${admin.name} is already admin`);
    }

    // Ensure license exists
    const License = require('./models/License');
    const lic = await License.findOne({ userId: admin._id });
    if (!lic) {
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await License.create({ userId: admin._id, licenseType: 'trial', status: 'active', trialEndDate: trialEnd });
      console.log('   ✅ Trial license created for admin');
    } else {
      console.log(`   ✅ License exists: ${lic.licenseType} / ${lic.status}`);
    }
  } else {
    // Create admin user from scratch
    console.log(`   Creating admin user: ${adminEmail}`);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('PhinTech2026!', salt);
    const newAdmin = await User.create({
      name: 'Phin Admin', email: adminEmail,
      password: hash, phone: '0712345678',
      address: 'Nairobi, Kenya', role: 'admin',
    });
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await License.create({ userId: newAdmin._id, licenseType: 'trial', status: 'active', trialEndDate: trialEnd });
    console.log(`   ✅ Admin created: ${adminEmail} / PhinTech2026!`);
  }

  // ── Summary ──────────────────────────────────────────────────
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments();
  console.log('\n📊 Database Summary:');
  console.log(`   Books: ${totalBooks}`);
  console.log(`   Users: ${totalUsers}`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Admin login:');
  console.log('  Email   : admin@phintechsolutions.com');
  console.log('  Password: PhinTech2026!');
  console.log('\nFrontend: https://phintech-bookstore.vercel.app');
  console.log('Backend : https://api-phintech-bookstore.vercel.app\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
