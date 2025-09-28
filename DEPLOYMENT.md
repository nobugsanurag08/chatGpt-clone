# Deployment Guide

This guide will help you deploy your ChatGPT clone to Vercel with all the necessary configurations.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy Button (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/chatgpt-clone)

### Option 2: Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

## 🔧 Environment Variables Setup

After deploying, you need to configure environment variables in Vercel:

### How to Add Environment Variables in Vercel

1. Go to your project dashboard on [vercel.com](https://vercel.com)
2. Click on your project
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add each variable with its value
6. Click **Save** after adding each variable
7. **Important**: After adding all variables, go to **Deployments** tab and click **Redeploy** to apply the new environment variables

### Required Environment Variables

1. **OpenAI API Key** (Required)
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add to Vercel: 
     - **Name**: `OPENAI_API_KEY`
     - **Value**: `your_openai_api_key_here`

2. **MongoDB Atlas** (Required)
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string
   - Add to Vercel:
     - **Name**: `MONGODB_URI`
     - **Value**: `mongodb+srv://username:password@cluster.mongodb.net/chatgpt-clone`

3. **Cloudinary** (Required for file uploads)
   - Create account at [Cloudinary](https://cloudinary.com)
   - Get credentials from dashboard
   - Add to Vercel:
     - **Name**: `CLOUDINARY_CLOUD_NAME` | **Value**: `your_cloud_name`
     - **Name**: `CLOUDINARY_API_KEY` | **Value**: `your_api_key`
     - **Name**: `CLOUDINARY_API_SECRET` | **Value**: `your_api_secret`

4. **Clerk Authentication** (Required)
   - Create account at [Clerk](https://clerk.com)
   - Create new application
   - Get keys from dashboard
   - Add to Vercel:
     - **Name**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Value**: `pk_test_...`
     - **Name**: `CLERK_SECRET_KEY` | **Value**: `sk_test_...`

5. **NextAuth Configuration** (Required)
   - Generate a random secret: `openssl rand -base64 32`
   - Add to Vercel:
     - **Name**: `NEXTAUTH_URL` | **Value**: `https://your-project.vercel.app`
     - **Name**: `NEXTAUTH_SECRET` | **Value**: `your_generated_secret`

### Environment Variables Checklist

- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `NEXTAUTH_URL` - Your Vercel app URL
- [ ] `NEXTAUTH_SECRET` - Random secret string

### Troubleshooting

If you get the error "Environment Variable references Secret which does not exist":
1. Make sure you've removed any `vercel.json` file from your project
2. Add environment variables directly in Vercel dashboard (not as secrets)
3. Redeploy your application after adding all variables

## 📱 Mobile Optimization

The app is fully responsive and optimized for:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure proper CORS settings
3. **Rate Limiting**: Consider implementing rate limiting
4. **File Upload**: Validate file types and sizes
5. **Environment Variables**: Use Vercel's environment variable system

## 🚀 Performance Optimizations

1. **Image Optimization**: Cloudinary handles automatic optimization
2. **Streaming**: Real-time AI responses with streaming
3. **Caching**: Efficient database queries and caching
4. **Code Splitting**: Dynamic imports for better performance

## 📊 Monitoring

1. **Vercel Analytics**: Built-in analytics with Vercel
2. **Error Tracking**: Monitor errors in Vercel dashboard
3. **Performance**: Use Vercel's performance insights

## 🔄 Updates and Maintenance

1. **Automatic Deployments**: Push to main branch for auto-deploy
2. **Environment Updates**: Update environment variables in Vercel dashboard
3. **Database Backups**: MongoDB Atlas provides automatic backups

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Runtime Errors**
   - Check API keys are correct
   - Verify database connection
   - Check Cloudinary configuration

3. **Mobile Issues**
   - Test on different devices
   - Check responsive breakpoints
   - Verify touch interactions

### Support

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check project [Issues](https://github.com/your-repo/chatgpt-clone/issues)

## 📈 Scaling

For high-traffic applications:

1. **Database**: Consider MongoDB Atlas M10+ for better performance
2. **CDN**: Vercel provides global CDN automatically
3. **Caching**: Implement Redis for session caching
4. **Monitoring**: Use advanced monitoring tools

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] File uploads working
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backup strategy implemented

---

**Your ChatGPT clone is now ready for production! 🎉**
