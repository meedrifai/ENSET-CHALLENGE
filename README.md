# EDGUARD - Academic Integrity Protection System

EDGUARD is an advanced academic integrity protection system that uses AI to monitor and ensure fair academic practices during online examinations and quizzes.

## 🌟 Features

### Student Features
- Real-time cognitive pattern analysis
- Secure exam environment
- Interactive quiz interface
- Progress tracking
- Personalized feedback

### Teacher Features
- Exam creation and management
- Real-time monitoring dashboard
- Student performance analytics
- Fraud detection reports
- Automated grading system

### Admin Features
- User management
- System configuration
- Access control
- Analytics dashboard
- Security monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Python 3.8+ (for backend services)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/edguard.git
cd edguard
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

5. Start the development servers
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
python app.py
```

## 🏗️ Project Structure

```
edguard/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── styles/          # Global styles
│   └── public/              # Static files
│
├── backend/                  # Python backend application
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── tests/               # Backend tests
│
└── docs/                    # Documentation
```

## 🔒 Security Features

- Real-time face detection
- Multiple person detection
- Position monitoring
- Audio analysis
- Browser lockdown
- Screen recording prevention

## 🛠️ Technologies Used

### Frontend
- Next.js 13+
- React
- Tailwind CSS
- WebRTC
- Face-API.js

### Backend
- Python
- Flask
- MongoDB
- WebSocket
- OpenCV

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/student/login` - Student login
- `POST /api/teacher/login` - Teacher login
- `POST /api/admin/login` - Admin login

### Exam Management
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam
- `GET /api/exams/:id` - Get exam details

### Monitoring
- `GET /api/monitoring/status` - Get monitoring status
- `POST /api/monitoring/alert` - Report violation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Face-API.js for face detection capabilities
- Next.js team for the amazing framework
- All contributors who have helped shape this project

## 📞 Support

For support, email support@edguard.com or join our Slack channel.

## 🔄 Updates

### Latest Updates
- Added real-time monitoring dashboard
- Implemented advanced fraud detection
- Enhanced user interface
- Added multi-language support

### Upcoming Features
- Mobile application
- Advanced analytics
- Integration with LMS systems
- AI-powered proctoring
