# Deployment Guide for Bangladeshi E-Commerce Platform

## Architecture Overview
This is a full-stack application with:
- **Frontend**: React/Vite app (deployed to Netlify)
- **Backend**: Express/TypeScript API with MongoDB (requires separate hosting)
- **Database**: MongoDB Atlas (cloud database)

## Deployment Strategy

### Step 1: Deploy Backend to Vercel (Recommended)
Since your backend is already configured for Vercel, this is the easiest option:

1. **Push backend code to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the backend configuration

3. **Set Environment Variables in Vercel**:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   CLIENT_URL=https://ffashion.netlify.app
   PORT=5000
   ```

4. **Deploy**: Vercel will build and deploy your backend

### Step 2: Deploy Frontend to Netlify
1. **Connect Netlify to GitHub**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Add new site → Import from Git
   - Select your repository

2. **Configure Build Settings**:
   - Build command: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - Publish directory: `frontend/dist`

3. **Set Environment Variables in Netlify**:
   ```
   VITE_API_BASE_URL=https://your-vercel-backend-url.vercel.app/api/v1
   ```

4. **Deploy**: Netlify will build and deploy your frontend

### Step 3: Update API Configuration
After your backend is deployed, update these files with your actual backend URL:

1. **netlify.toml**:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-vercel-backend-url.vercel.app/api/:splat"
   ```

2. **frontend/src/services/api.ts**:
   ```typescript
   ? "https://your-vercel-backend-url.vercel.app/api/v1"
   ```

### Alternative: Deploy Backend to Render/Railway
If you prefer not to use Vercel:

#### Render (Free Tier Available)
1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create new "Web Service"
4. Select `backend` folder as root
5. Build command: `npm run build`
6. Start command: `npm start`
7. Add environment variables (same as Vercel)

#### Railway (Free Tier Available)
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy from repository
4. Add environment variables

## MongoDB Atlas Setup
Your database is already configured with MongoDB Atlas. To ensure proper connection:

1. **Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs) or specific Vercel/Render IPs

2. **Database Access**:
   - Ensure your database user has proper permissions
   - Current connection string: `mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce`

3. **Environment Variables**:
   - Never commit actual MongoDB credentials to git
   - Use environment variables in production

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://ffashion.netlify.app

# Security
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Payment Gateways (Optional)
BKASH_APP_KEY=your_key
BKASH_APP_SECRET=your_secret
# ... other payment configs
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
VITE_APP_NAME="SHOROBOR | Bangladeshi Heritage E-Commerce"
VITE_ENABLE_MOCK_FALLBACK=true
VITE_DEFAULT_CURRENCY=BDT
```

## Testing the Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.vercel.app/api/v1/health
   ```

2. **Test Frontend**:
   - Visit https://ffashion.netlify.app
   - Check browser console for API connection errors

3. **Test Database Connection**:
   - Check Vercel/Render logs for MongoDB connection messages
   - Look for "✅ [MongoDB] Connected successfully" message

## Troubleshooting

### Frontend Shows "Page not found"
- Check Netlify build logs
- Ensure publish directory is `frontend/dist`
- Verify build command completed successfully

### API Connection Errors
- Verify backend URL is correct in environment variables
- Check CORS configuration in backend allows Netlify domain
- Ensure backend is deployed and running

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string is correct
- Ensure database user has proper permissions
- Check MongoDB Atlas logs for connection attempts

### Payment Gateway Issues
- Ensure payment gateway credentials are set in environment variables
- Verify sandbox vs production mode settings
- Check payment gateway dashboard for API call logs

## Next Steps

1. Deploy backend to Vercel/Render/Railway
2. Get the backend URL
3. Update frontend configuration with backend URL
4. Redeploy frontend to Netlify
5. Test full application flow
6. Set up monitoring and error tracking