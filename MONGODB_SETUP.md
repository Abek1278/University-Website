# MongoDB Setup Instructions

## Option 1: MongoDB Atlas (Cloud - Recommended for Development)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/academic-classroom`)
5. Update the `.env` file:
   ```
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/academic-classroom
   ```

## Option 2: Local MongoDB Installation

### Windows

1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will be installed to `C:\Program Files\MongoDB\Server\X.X\`
4. The service will start automatically
5. Verify connection with: `mongosh "mongodb://localhost:27017"`

After installation, MongoDB should automatically connect using the default MONGO_URI in .env

## Verify MongoDB Connection

Once you have MongoDB set up, restart the server with:
```
npm run server
```

You should see the message:
```
✅ MongoDB Connected
```

## Seed Database with Default Subjects

After MongoDB connects, run:
```
npm run seed
```

This will populate the database with default subjects and engineering courses.

## Testing the Application

Once both the server and client are running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Demo credentials:
- Student: student@test.com / password
- Admin: admin@test.com / password
