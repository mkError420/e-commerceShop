# Deployment Guide for Bangladeshi E-Commerce Platform

## Architecture Overview
This is a full-stack application with:
- **Frontend**: React/Vite app (deployed to Netlify)
- **Backend**: Express/TypeScript API with MongoDB (deployed to Netlify)
- **Database**: MongoDB Atlas (cloud database)

## Current Deployment Setup

### ✅ Frontend: https://ffashion.netlify.app
- React/Vite application
- Static site deployment
- Connected to backend via API calls

### ✅ Backend: https://backend.netlify.app
- Express/TypeScript API
- Connected to MongoDB Atlas
- Handles authentication, products, orders, etc.

## Deployment Configuration

### Frontend Netlify Configuration (netlify.toml)
```toml
[build]
  command = "cd frontend && npm install --legacy-peer-deps && npm run build"
  publish = "frontend/dist"

[context.production.environment]
  VITE_API_BASE_URL = "https://backend.netlify.app/api/v1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend Environment Variables
Set these in your Netlify backend site settings:

```
MONGODB_URI=mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9ed4a9d9736d802af5d92e784adafe86627d6377338ef9f86e97bef504fe18ccebe490e1253b0e205f03129e4bf243f6c829323f14bc6722f3397c87f42ec095
NODE_ENV=production
CLIENT_URL=https://ffashion.netlify.app
PORT=5000
```

## Backend Deployment Options

### Option 1: Netlify Functions (Current Setup)
The backend is deployed as a Netlify site. For serverless functions:

1. **Create Netlify Functions**:
   - Add `netlify/functions/api.ts` with serverless handler
   - Install dependencies: `serverless-http`, `@netlify/functions`

2. **Update netlify.toml in backend**:
   ```toml
   [build]
     command = "npm install && npm run build"
     publish = "dist"

   [functions]
     directory = "netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

### Option 2: Alternative Backend Hosting
If Netlify doesn't work well for the backend, consider:

#### Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `backend`
4. Add environment variables (same as above)
5. Deploy

#### Render (Free Tier Available)
1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create new "Web Service"
4. Select `backend` folder as root
5. Build command: `npm run build`
6. Start command: `npm start`
7. Add environment variables

#### Railway (Free Tier Available)
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy from repository
4. Add environment variables

## MongoDB Atlas Setup
Your database is already configured with MongoDB Atlas. To ensure proper connection:

1. **Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs) for Netlify deployment

2. **Database Access**:
   - Ensure your database user has proper permissions
   - Current connection string: `mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce`

3. **Environment Variables**:
   - Never commit actual MongoDB credentials to git
   - Use environment variables in production (already configured in Netlify backend)

## Environment Variables Reference

### Backend (Netlify Site Settings)
```env
MONGODB_URI=mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9ed4a9d9736d802af5d92e784adafe86627d6377338ef9f86e97bef504fe18ccebe490e1253b0e205f03129e4bf243f6c829323f14bc6722f3397c87f42ec095
NODE_ENV=production
CLIENT_URL=https://ffashion.netlify.app
PORT=5000
```

### Frontend (Netlify Site Settings)
```env
VITE_API_BASE_URL=https://backend.netlify.app/api/v1
```

### Local Development (.env)
```env
# Backend
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=dev-secret-key
MONGODB_URI=mongodb://localhost:27017/bangladesh_ecommerce

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Testing the Deployment

1. **Test Backend**:
   ```bash
   curl https://backend.netlify.app/api/v1/auth/health
   ```
   Or visit the backend URL directly in your browser

2. **Test Frontend**:
   - Visit https://ffashion.netlify.app
   - Check browser console for API connection errors
   - Try to navigate through the application

3. **Test Database Connection**:
   - Check Netlify backend logs for MongoDB connection messages
   - Look for "✅ [MongoDB] Connected successfully" message
   - Verify data is being saved/loaded from MongoDB

4. **Test Authentication**:
   - Try to register a new user
   - Try to login with existing credentials
   - Check if admin authentication works

## Troubleshooting

### Frontend Shows "Page not found"
- Check Netlify build logs
- Ensure publish directory is `frontend/dist`
- Verify build command completed successfully
- Check if netlify.toml is in the root directory

### API Connection Errors
- Verify backend URL is correct: `https://backend.netlify.app/api/v1`
- Check CORS configuration in backend allows `.netlify.app` domains
- Ensure backend is deployed and running
- Check Netlify backend logs for errors

### Backend Deployment Issues
- If Netlify backend doesn't work, try Vercel instead
- Ensure all environment variables are set in Netlify backend
- Check MongoDB connection string is correct
- Verify backend build command succeeds

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string is correct
- Ensure database user has proper permissions
- Check MongoDB Atlas logs for connection attempts
- Verify environment variables are set correctly

### Payment Gateway Issues
- Ensure payment gateway credentials are set in environment variables
- Verify sandbox vs production mode settings
- Check payment gateway dashboard for API call logs

## Current Status

✅ **Frontend**: Deployed to Netlify (https://ffashion.netlify.app)
✅ **Backend**: Deployed to Netlify (https://backend.netlify.app)
✅ **MongoDB**: Connected to MongoDB Atlas
✅ **Environment Variables**: Configured for production
✅ **CORS**: Updated to allow Netlify domains

## Next Steps

1. **Test the full application flow**:
   - Visit https://ffashion.netlify.app
   - Try user registration and login
   - Test product browsing and cart functionality
   - Verify admin dashboard access

2. **Monitor performance**:
   - Check Netlify logs for any errors
   - Monitor MongoDB Atlas for database performance
   - Set up error tracking (e.g., Sentry)

3. **Optional improvements**:
   - Add CDN for static assets
   - Implement caching strategies
   - Set up automated backups
   - Configure analytics