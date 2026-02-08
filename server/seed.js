const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const defaultSubjects = [
  {
    name: 'Applied Mathematics – I',
    code: 'MATH101',
    description: 'Fundamental mathematics including calculus, differential equations, and linear algebra for engineering applications.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Applied Physics – I',
    code: 'PHY101',
    description: 'Core physics concepts including mechanics, thermodynamics, and wave motion with engineering applications.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Applied Chemistry – I',
    code: 'CHEM101',
    description: 'Chemical principles, atomic structure, bonding, and material science fundamentals for engineers.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Engineering Mechanics',
    code: 'MECH101',
    description: 'Statics and dynamics, force systems, equilibrium, friction, and kinematics of particles and rigid bodies.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Basic Electrical & Electronics Engineering',
    code: 'EEE101',
    description: 'Electrical circuits, network theorems, AC/DC machines, semiconductor devices, and basic electronics.',
    credits: 4,
    semester: 1
  },
  {
    name: 'C Programming',
    code: 'CS101',
    description: 'Introduction to programming using C language, data structures, algorithms, and problem-solving techniques.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Python Programming',
    code: 'CS102',
    description: 'Python fundamentals, object-oriented programming, data analysis, and application development.',
    credits: 4,
    semester: 1
  },
  {
    name: 'Engineering Workshop',
    code: 'WORK101',
    description: 'Hands-on training in various engineering trades including fitting, welding, machining, and carpentry.',
    credits: 2,
    semester: 1
  }
  ,
  {
    name: 'Engineering Drawing',
    code: 'ED101',
    description: 'Fundamentals of technical drawing, orthographic projection, and engineering sketches.',
    credits: 2,
    semester: 1
  },
  {
    name: 'Environmental Science',
    code: 'ENV101',
    description: 'Introduction to environmental systems, sustainability, pollution control and resource management.',
    credits: 2,
    semester: 1
  },
  {
    name: 'Communication Skills',
    code: 'COM101',
    description: 'Basics of effective technical communication, report writing, and presentation skills.',
    credits: 2,
    semester: 1
  },
  {
    name: 'Engineering Graphics Lab',
    code: 'EGL101',
    description: 'Practical sessions for engineering drawing and CAD basics.',
    credits: 1,
    semester: 1
  },
  {
    name: 'Materials Science',
    code: 'MATS101',
    description: 'Introduction to engineering materials, properties, and applications in manufacturing.',
    credits: 3,
    semester: 1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');

    const existingSubjects = await Subject.countDocuments();
    
    if (existingSubjects === 0) {
      await Subject.insertMany(defaultSubjects);
      console.log('✅ Default subjects created successfully!');
      console.log(`📚 Created ${defaultSubjects.length} subjects`);
    } else {
      console.log('ℹ️  Subjects already exist in database');
    }

    await mongoose.connection.close();
    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
