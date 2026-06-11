import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Models
import User from './models/User.js';
import Student from './models/Student.js';
import WingChairman from './models/WingChairman.js';
import Wing from './models/Wing.js';
import Program from './models/Program.js';
import Group from './models/Group.js';
import Registration from './models/Registration.js';
import Schedule from './models/Schedule.js';
import Result from './models/Result.js';
import Certificate from './models/Certificate.js';
import Publication from './models/Publication.js';
import Library from './models/Library.js';
import Finance from './models/Finance.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for database seeding.');

    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await WingChairman.deleteMany({});
    await Wing.deleteMany({});
    await Program.deleteMany({});
    await Group.deleteMany({});
    await Registration.deleteMany({});
    await Schedule.deleteMany({});
    await Result.deleteMany({});
    await Certificate.deleteMany({});
    await Publication.deleteMany({});
    await Library.deleteMany({});
    await Finance.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // Hashes
    const superPassword = await bcrypt.hash('super123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const chairmanPassword = await bcrypt.hash('chairman123', 10);
    const treasurerPassword = await bcrypt.hash('treasurer123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // 1. Create Users
    console.log('Seeding user credentials...');
    const superUser = await User.create({ username: 'superadmin', password: superPassword, plainPassword: 'super123', role: 'super_admin' });
    const adminUser = await User.create({ username: 'admin', password: adminPassword, plainPassword: 'admin123', role: 'admin' });
    const chairmanUser = await User.create({ username: 'chairman1', password: chairmanPassword, plainPassword: 'chairman123', role: 'wing_chairman' });
    const treasurerUser = await User.create({ username: 'treasurer1', password: treasurerPassword, plainPassword: 'treasurer123', role: 'treasurer' });
    const studentUser = await User.create({ username: 'student1', password: studentPassword, plainPassword: 'student123', role: 'student' });
    const student2User = await User.create({ username: 'student2', password: studentPassword, plainPassword: 'student123', role: 'student' });

    // 2. Create Chairmen & Student Profiles
    console.log('Seeding profiles...');
    const chairmanProfile = await WingChairman.create({
      userId: chairmanUser._id,
      name: 'Dr. Faisal Rahman',
      wing: 'Red Wing',
      phone: '555-0101',
      email: 'faisal@shaadmates.com'
    });

    const studentProfile = await Student.create({
      userId: studentUser._id,
      name: 'John Doe',
      studentId: 'S-1002',
      admissionNumber: 'ADM-2026-001',
      class: 'Class XII - A',
      wing: 'Red Wing',
      dob: new Date('2009-05-15'),
      address: '123 Campus Lane, Cityville',
      phone: '555-0199',
      email: 'john@shaadmates.com'
    });

    const student2Profile = await Student.create({
      userId: student2User._id,
      name: 'Jane Smith',
      studentId: 'S-1003',
      admissionNumber: 'ADM-2026-002',
      class: 'Class XII - B',
      wing: 'Red Wing',
      dob: new Date('2009-08-20'),
      address: '456 College Blvd, Cityville',
      phone: '555-0211',
      email: 'jane@shaadmates.com'
    });

    // 3. Create Wings
    console.log('Seeding wings...');
    const wingRed = await Wing.create({
      name: 'Red Wing',
      logo: '/logos/red_wing.png',
      description: 'Department focusing on Computer Science, IT, and Mathematics.',
      chairmanId: chairmanProfile._id
    });
    await Wing.create({ name: 'Blue Wing', logo: '/logos/blue_wing.png', description: 'Department of Fine Arts and Literature.' });
    await Wing.create({ name: 'Green Wing', logo: '/logos/green_wing.png', description: 'Department of Sports and Athletics.' });
    await Wing.create({ name: 'Yellow Wing', logo: '/logos/yellow_wing.png', description: 'Department of Scientific Research.' });

    // 4. Create Programs
    console.log('Seeding programs...');
    const program1 = await Program.create({
      title: 'Cyber Code Combat',
      type: 'group',
      wing: 'Red Wing',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '10:00 AM - 01:00 PM',
      venue: 'Red Wing IT Labs',
      description: 'Solve advanced competitive programming problems in teams of 2 or 3.',
      maxParticipants: 15,
      rules: ['No internet lookups', 'Use C++, Java, or Python', 'Strict 3-hour limit'],
      approved: true,
      status: 'Active',
      createdBy: chairmanUser._id
    });

    const program2 = await Program.create({
      title: 'Arabic Elocution Contest',
      type: 'single',
      wing: 'Blue Wing',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      time: '02:00 PM - 04:30 PM',
      venue: 'Auditorium Hall B',
      description: 'Showcase your Arabic speech fluency on modern cultural topics.',
      maxParticipants: 30,
      rules: ['Speeches must be between 3 to 5 minutes', 'No reading from paper', 'Correct pronunciation checks'],
      approved: true,
      status: 'Active'
    });

    const program3 = await Program.create({
      title: 'Urdu Essay Writing',
      type: 'single',
      wing: 'Blue Wing',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: '11:00 AM - 12:30 PM',
      venue: 'Seminar Room 2',
      description: 'Write an essay on contemporary educational reforms in Urdu.',
      maxParticipants: 50,
      rules: ['Word count: 800 - 1000 words', 'Duration: 90 minutes', 'Writing sheets provided'],
      approved: false, // Pending
      status: 'Upcoming'
    });

    // 5. Create Schedules
    console.log('Seeding schedules...');
    await Schedule.create({
      programId: program1._id,
      date: program1.date,
      time: program1.time,
      venue: program1.venue,
      description: 'Report to IT Lab 2 by 09:45 AM. Ensure IDE setups are pre-configured.'
    });

    await Schedule.create({
      programId: program2._id,
      date: program2.date,
      time: program2.time,
      venue: program2.venue,
      description: 'Verify registration card numbers at the entrance desk before 01:45 PM.'
    });

    // 6. Create Digital Library Books
    console.log('Seeding library books...');
    await Library.create({
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      pdfUrl: '/library/books/clrs.pdf',
      downloads: 42,
      description: 'Standard textbook for algorithms analysis and data structures.'
    });

    await Library.create({
      title: 'Arabic Grammar Made Simple',
      author: 'Dr. Muhammad Ali',
      category: 'Language Studies',
      pdfUrl: '/library/books/arabic_grammar.pdf',
      downloads: 18,
      description: 'Easy-to-follow guide for mastering the basic grammar of standard Arabic.'
    });

    await Library.create({
      title: 'Diwan-e-Ghalib',
      author: 'Mirza Asadullah Khan Ghalib',
      category: 'Urdu Poetry',
      pdfUrl: '/library/books/ghalib.pdf',
      downloads: 57,
      description: 'The canonical collection of ghazals and shers written by Mirza Ghalib.'
    });

    // 7. Seed Finances
    console.log('Seeding financial transactions...');
    await Finance.create({
      type: 'income',
      category: 'Sponsorship',
      amount: 15000,
      description: 'Event sponsorship for Cyber Code Combat from TechCorp.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    await Finance.create({
      type: 'income',
      category: 'Donation',
      amount: 5000,
      description: 'Alumni community donation.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    await Finance.create({
      type: 'expense',
      category: 'Printing',
      amount: 1200,
      description: 'Brochure printing for Blue Wing speeches.',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await Finance.create({
      type: 'expense',
      category: 'Decorations',
      amount: 2500,
      description: 'Hall stage setups for elocution.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // 8. Seed Audit Log
    console.log('Writing system audit baseline...');
    await AuditLog.create({
      username: 'system',
      action: 'SYSTEM_SEED',
      details: 'Successfully seeded database for Shaad-Mates WebSuite ERP.'
    });

    console.log('Database seeded successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
  }
};

seedDB();
