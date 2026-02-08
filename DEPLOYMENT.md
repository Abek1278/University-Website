# Deployment Guide

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or cloud)
- npm or yarn

## Environment Setup

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=your_frontend_url
ADMIN_SECRET_KEY=your_admin_secret_key
```

## Local Development

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Seed the database with default subjects:
```bash
node server/seed.js
```

3. Start the backend server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Run Both Simultaneously

From the root directory:
```bash
npm run dev
```

## Production Deployment

### Option 1: Traditional Hosting (VPS/Dedicated Server)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Configure your web server (nginx/Apache) to serve the built files and proxy API requests to the backend.

3. Use PM2 to manage the Node.js process:
```bash
npm install -g pm2
pm2 start server/index.js --name academic-platform
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop containers:
```bash
docker-compose down
```

### Option 3: Cloud Platforms

#### Heroku

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Add MongoDB addon:
```bash
heroku addons:create mongolab
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set ADMIN_SECRET_KEY=your_admin_key
```

4. Deploy:
```bash
git push heroku main
```

#### Vercel (Frontend) + MongoDB Atlas (Database)

1. Deploy frontend to Vercel:
```bash
cd client
vercel
```

2. Deploy backend to a Node.js hosting service (Railway, Render, etc.)

3. Update environment variables with production URLs

#### AWS/Azure/GCP

Follow platform-specific deployment guides for Node.js applications.

## Database Setup

### MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP address
3. Create a database user
4. Get the connection string and update `MONGODB_URI` in `.env`

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/academic-classroom` as `MONGODB_URI`

## Post-Deployment

1. Run the seed script to create default subjects:
```bash
node server/seed.js
```

2. Create admin account:
   - Register with role: "admin"
   - Use the `ADMIN_SECRET_KEY` from your `.env` file

3. Test the application:
   - Login as admin
   - Create subjects
   - Register as student
   - Test all features

## Security Checklist

- [ ] Change default `JWT_SECRET`
- [ ] Change default `ADMIN_SECRET_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for sensitive data
- [ ] Keep dependencies updated
- [ ] Implement proper logging
- [ ] Set up monitoring and alerts

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 status
pm2 logs
```

### Application Health

Check the health endpoint:
```bash
curl http://your-domain.com/api/health
```

## Backup

### Database Backup

```bash
mongodump --uri="your_mongodb_uri" --out=/backup/directory
```

### Restore Database

```bash
mongorestore --uri="your_mongodb_uri" /backup/directory
```

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review logs for errors

### Frontend build fails
- Clear node_modules and reinstall
- Check for syntax errors
- Verify all dependencies are installed

### Real-time features not working
- Ensure Socket.io is properly configured
- Check CORS settings
- Verify WebSocket support on hosting platform

## Support

For issues and questions:
- Check the README.md
- Review application logs
- Check MongoDB connection
- Verify environment variables

## Scaling

For high traffic:
- Use load balancer
- Enable MongoDB replica sets
- Implement Redis for caching
- Use CDN for static assets
- Enable database indexing
- Implement horizontal scaling
