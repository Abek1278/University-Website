# AI Assistant Setup Guide

## 🤖 EduSense AI Integration

Your platform now includes an intelligent AI assistant powered by Google Gemini that provides personalized academic guidance to students.

---

## 🎯 Features

### Intelligent Academic Assistant
- **Deadline Intelligence**: Automatically checks and prioritizes assignments
- **Smart Reminders**: Warns about deadlines within 48 hours
- **Attendance Monitoring**: Alerts about low attendance risks
- **Announcement Awareness**: Surfaces important notices
- **Natural Conversation**: Friendly, professional academic mentor

### Data Access
The AI has real-time access to:
- Student profile (name, roll, semester)
- All enrolled subjects
- Assignment titles, descriptions, deadlines, and submission status
- Complete attendance records
- Recent announcements and notices

### Response Format
The AI automatically formats responses with:
- 📌 Pending Work with urgency levels
- 📢 Important Notices with priorities
- 📊 Attendance Watch with status indicators

---

## 🔑 Getting Your Gemini API Key

### Step 1: Go to Google AI Studio
Visit: https://makersuite.google.com/app/apikey

### Step 2: Create API Key
1. Click "Get API Key"
2. Select "Create API key in new project" or use existing project
3. Copy the generated API key

### Step 3: Add to Environment
Open your `.env` file and add:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**
```env
GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📦 Installation (Already Done)

The following package has been installed:
```bash
npm install @google/generative-ai
```

---

## 🚀 Usage

### For Students

1. **Access AI Assistant**
   - Login to your student account
   - Click "AI Assistant" in the sidebar (with ✨ icon)

2. **Quick Questions**
   - "What should I do today?"
   - "Do I have any pending assignments?"
   - "How's my attendance?"
   - "Any important announcements?"
   - "What's my academic status?"

3. **Natural Conversation**
   - Ask anything about your academics
   - Get personalized recommendations
   - Receive deadline reminders
   - Check attendance status

### Example Interactions

**Student:** "What should I do today?"

**AI Response:**
```
📌 Pending Work
• Applied Mathematics – Calculus Assignment
  Deadline: 08/01/2026
  Status: Not Submitted
  Urgency: High ⚠

• C Programming – Lab Assignment 3
  Deadline: 10/01/2026
  Status: Not Submitted
  Urgency: Medium

📊 Attendance Watch
• Applied Physics – 72% – Status: Risk ⚠
• Engineering Mechanics – 88% – Status: Safe
```

---

## 🔧 Technical Details

### Backend Components

**AI Service** (`server/services/aiService.js`)
- Gemini Pro model integration
- Context formatting for student data
- Conversation management
- Quick insights generation

**AI Routes** (`server/routes/ai.js`)
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/insights` - Get quick academic insights
- `GET /api/ai/student-context` - Fetch student data context

### Frontend Components

**AI Assistant Page** (`client/src/pages/AIAssistant.js`)
- Chat interface with message history
- Quick question buttons
- Real-time insights panel
- Responsive design with dark mode

### Navigation
- Added to both student and admin menus
- Accessible via `/student/ai-assistant` or `/admin/ai-assistant`
- Sparkles (✨) icon in sidebar

---

## 🎨 UI Features

- **Modern Chat Interface**: Glassmorphism design
- **Message Bubbles**: User and AI messages clearly distinguished
- **Quick Insights**: Automatic academic status summary
- **Quick Questions**: Pre-defined helpful queries
- **Loading States**: Smooth animations while AI thinks
- **Dark Mode**: Full support for light/dark themes
- **Responsive**: Works on mobile, tablet, and desktop

---

## 🔒 Security & Privacy

- All AI responses based ONLY on actual student data
- No data hallucination or invention
- Secure API key storage in environment variables
- Role-based access control
- Real-time data fetching

---

## 📊 AI Behavior Rules

1. **Deadline Intelligence**: Always checks assignment deadlines first
2. **Smart Reminders**: Warns about deadlines within 48 hours with ⚠
3. **Announcement Awareness**: Surfaces high-priority announcements
4. **Natural Conversation**: Responds like a friendly academic mentor
5. **No Hallucination**: Never invents assignments, marks, or notices
6. **Priority Order**: Deadlines → Announcements → Attendance → General chat

---

## 🧪 Testing the AI

### Test Scenario 1: Check Pending Work
```
Student: "What do I need to do?"
```
Expected: List of pending assignments with deadlines and urgency

### Test Scenario 2: Attendance Check
```
Student: "How's my attendance?"
```
Expected: Subject-wise attendance with percentages and status

### Test Scenario 3: General Query
```
Student: "What should I focus on this week?"
```
Expected: Prioritized list of tasks based on deadlines and attendance

---

## 🐛 Troubleshooting

### AI Not Responding
**Issue:** "Failed to process AI request"
**Solution:** 
1. Check if `GEMINI_API_KEY` is set in `.env`
2. Verify API key is valid
3. Check internet connection
4. Review server logs for errors

### Empty Responses
**Issue:** AI returns generic messages
**Solution:**
1. Ensure student has data (assignments, attendance)
2. Check database connections
3. Verify student is enrolled in subjects

### API Key Errors
**Issue:** "Invalid API key"
**Solution:**
1. Get new API key from Google AI Studio
2. Update `.env` file
3. Restart server: `npm run dev`

---

## 💡 Tips for Best Results

1. **Be Specific**: Ask clear questions about your academics
2. **Use Quick Questions**: Start with pre-defined queries
3. **Check Insights**: Review the automatic insights panel
4. **Regular Updates**: AI uses real-time data, so keep checking back

---

## 🚀 Advanced Features (Future)

Potential enhancements:
- Voice input/output
- Study schedule generation
- Exam preparation assistance
- Performance predictions
- Personalized study recommendations
- Integration with calendar apps
- Email/SMS notifications
- Multi-language support

---

## 📝 API Endpoints

### Chat with AI
```http
POST /api/ai/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "What should I do today?",
  "conversationHistory": []
}
```

### Get Quick Insights
```http
GET /api/ai/insights
Authorization: Bearer {token}
```

### Get Student Context
```http
GET /api/ai/student-context
Authorization: Bearer {token}
```

---

## 🎓 Educational Use Cases

1. **Daily Planning**: "What should I do today?"
2. **Deadline Management**: "What's due this week?"
3. **Attendance Monitoring**: "Am I at risk of low attendance?"
4. **Priority Setting**: "What's most urgent?"
5. **Status Checks**: "How am I doing academically?"
6. **Announcement Updates**: "Any important notices?"

---

## ✅ Verification Checklist

- [ ] Gemini API key obtained from Google AI Studio
- [ ] API key added to `.env` file
- [ ] Server restarted after adding API key
- [ ] AI Assistant appears in navigation menu
- [ ] Can access AI Assistant page
- [ ] Quick insights load successfully
- [ ] Can send messages and receive responses
- [ ] Responses are based on actual student data
- [ ] Dark mode works correctly
- [ ] Mobile responsive design works

---

## 🆘 Support

If you encounter issues:
1. Check server console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is connected
4. Test API key with a simple request
5. Review browser console for frontend errors

---

**Your AI Assistant is ready! 🎉**

Students can now get intelligent, personalized academic guidance powered by Google Gemini AI.
