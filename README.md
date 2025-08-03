# Study Abroad SaaS Platform

A comprehensive multi-tenant SaaS platform built with MERN stack that allows you to create and manage multiple study abroad agency websites for clients.

## 🚀 Features

### Super Admin Dashboard
- Client account creation and management
- Agency creation wizard with subdomain assignment
- System resource monitoring (RAM, storage, bandwidth)
- Analytics and reporting
- User role management
- Activity logging and audit trails

### Client Management
- Agency overview and statistics
- Brand customization (colors, logos, themes)
- Content management access
- Resource usage monitoring
- Support ticket system

### Agency Websites
- Dynamic website generation with customizable themes
- Country/destination pages
- Services showcase and program catalogs
- Success stories and testimonials
- Blog/news sections
- Contact forms and lead capture

### Agency Admin Panels
- Drag-and-drop page builder
- Lead and student management CRM
- Dynamic form builder
- Media library management
- SEO settings and analytics

## 🛠 Tech Stack

- **Frontend**: React 18+ with Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcrypt
- **Real-time**: Socket.io for notifications
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Headless UI, Radix UI
- **Animations**: Framer Motion, Lottie React
- **File Storage**: AWS S3 / Cloudinary integration

## 📁 Project Structure

```
/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and utilities
└── docs/            # Documentation
```

## 🏗 Architecture

### Multi-Tenant Structure
- **Super Admin**: `superadmin.yourdomain.com`
- **Agency Websites**: `clientname.yourdomain.com`
- **Agency Admin**: `admin-clientname.yourdomain.com`

### Database Collections
- Super Admins, Clients, Agencies
- Students/Leads, Pages, Forms (per agency)
- System metrics and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd study-abroad-saas
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Server environment
cp server/.env.example server/.env

# Client environment  
cp client/.env.example client/.env
```

4. Start development servers
```bash
npm run dev
```

## 🔧 Environment Variables

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/study-abroad-saas
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-s3-bucket
AWS_REGION=us-east-1

# Or Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Super Admin
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=your-secure-password

NODE_ENV=development
PORT=5000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Study Abroad SaaS
```

## 📋 Development Phases

### Phase 1: Core Infrastructure ✅
- Super Admin dashboard with client management
- Multi-tenant database setup
- Authentication system
- Basic agency creation wizard

### Phase 2: Agency Websites 🚧
- Dynamic agency website generation
- Customization system (colors, logos, content)
- Content management system
- Form builder

### Phase 3: Agency Admin Panels 📋
- Lead/student management system
- Advanced content management
- Analytics dashboard
- User management

### Phase 4: Advanced Features 📋
- Real-time notifications
- Resource monitoring
- Performance optimization
- Advanced analytics

## 🔗 API Documentation

### Super Admin APIs
- `POST /api/superadmin/auth/login` - Super admin login
- `GET /api/superadmin/clients` - Get all clients
- `POST /api/superadmin/agencies` - Create new agency
- `GET /api/superadmin/system/resources` - System monitoring

### Client APIs
- `POST /api/client/auth/login` - Client login
- `GET /api/client/agencies` - Get client's agencies
- `PUT /api/client/agencies/:id/branding` - Update branding

### Agency Public APIs
- `GET /api/:subdomain/pages/:slug` - Get page content
- `POST /api/:subdomain/forms/:id/submit` - Submit form

## 🔒 Security Features

- JWT token authentication
- Rate limiting per agency
- CORS configuration
- Input validation and sanitization
- File upload security
- XSS protection
- HTTPS enforcement

## 📊 Monitoring & Analytics

- System resource tracking
- Agency performance metrics
- User engagement analytics
- Error logging and monitoring
- Real-time notifications

## 🚀 Deployment

### Production Setup
- Frontend: Vercel/Netlify
- Backend: AWS EC2/DigitalOcean
- Database: MongoDB Atlas
- File Storage: AWS S3/Cloudinary
- CDN: CloudFlare
- Monitoring: DataDog/New Relic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.