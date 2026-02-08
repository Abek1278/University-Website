const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const detailedSubjects = [
  {
    name: 'Applied Mathematics – I',
    code: 'MATH101',
    description: 'Fundamental mathematics including calculus, differential equations, and linear algebra for engineering applications.',
    credits: 4,
    semester: 1,
    totalLectures: 4,
    isActive: true
  },
  {
    name: 'Basic Electrical & Electronics Engineering',
    code: 'EEE101',
    description: 'Electrical circuits, network theorems, AC/DC machines, semiconductor devices, and basic electronics.',
    credits: 4,
    semester: 1,
    totalLectures: 0,
    isActive: true
  },
  {
    name: 'Engineering Mechanics',
    code: 'MECH101',
    description: 'Statics and dynamics, force systems, equilibrium, friction, and kinematics of particles and rigid bodies.',
    credits: 4,
    semester: 1,
    totalLectures: 0,
    isActive: true
  }
];

const upsertSubjects = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-classroom';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected for detailed seed');

    for (const subj of detailedSubjects) {
      const updated = await Subject.findOneAndUpdate(
        { code: subj.code },
        { $set: subj },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`- Upserted ${updated.code} (${updated._id})`);
    }

    await mongoose.connection.close();
    console.log('✅ Detailed seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in detailed seeding:', err);
    process.exit(1);
  }
};

upsertSubjects();
