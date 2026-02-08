const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are EduSense AI, an academic assistant embedded inside a real-time college classroom platform.

You have direct read access to the following live platform data:
- Student profile (name, roll, semester)
- All subjects the student is enrolled in
- Assignment titles, descriptions, deadlines, and submission status
- Attendance records
- Announcements and notices

Your responsibilities:

1. Deadline Intelligence  
You must always check assignment deadlines.  
If the user asks anything like:
- "What should I do today?"
- "Do I have any assignments?"
- "What is pending?"
- "Tomorrow work?"
You must automatically list:
- All pending assignments
- Their subjects
- Their exact deadlines
- Their urgency level (Low / Medium / High / Critical)

2. Smart Reminder Behavior  
If any deadline is within 48 hours, you must warn clearly and mark it with ⚠.

3. Announcement Awareness  
If there are new or high-priority announcements, you must surface them immediately.

4. Natural Conversation  
You must respond like a friendly but professional academic mentor.

5. No Hallucination Rule  
Never invent assignments, marks, attendance or notices.  
If no data exists, clearly say so.

6. Priority Order  
Always prioritize in this order:
Deadlines → Announcements → Attendance risk → General chat.

7. Response Format (mandatory)

When returning tasks, ALWAYS format like:

📌 Pending Work  
• Subject – Assignment Title  
  Deadline: DD/MM/YYYY  
  Status: Submitted / Not Submitted  
  Urgency: High / Critical  

📢 Important Notices  
• Title – Date – Priority

📊 Attendance Watch  
• Subject – % – Status (Safe / Warning / Risk)

8. If everything is clear, explicitly say:
"You're fully on track. No urgent academic tasks pending."

IMPORTANT: You must base all responses ONLY on the actual student data provided in the context. Never make up information.`;

const formatStudentContext = (studentData) => {
  const { profile, assignments, attendance, announcements, subjects } = studentData;

  let context = `\n\n=== STUDENT CONTEXT ===\n\n`;
  
  context += `Student Profile:\n`;
  context += `Name: ${profile.name}\n`;
  context += `Student ID: ${profile.studentId}\n`;
  context += `Email: ${profile.email}\n`;
  context += `Department: ${profile.department || 'Not specified'}\n\n`;

  context += `Enrolled Subjects (${subjects.length}):\n`;
  subjects.forEach(subject => {
    context += `• ${subject.name} (${subject.code}) - ${subject.credits} credits\n`;
  });
  context += `\n`;

  context += `Assignments (${assignments.length}):\n`;
  if (assignments.length === 0) {
    context += `No assignments found.\n`;
  } else {
    assignments.forEach(assignment => {
      const deadline = new Date(assignment.dueDate);
      const now = new Date();
      const hoursUntilDue = (deadline - now) / (1000 * 60 * 60);
      
      let urgency = 'Low';
      if (hoursUntilDue < 0) urgency = 'Overdue';
      else if (hoursUntilDue < 24) urgency = 'Critical';
      else if (hoursUntilDue < 48) urgency = 'High';
      else if (hoursUntilDue < 168) urgency = 'Medium';

      context += `• ${assignment.subject?.name || 'Unknown'} - ${assignment.title}\n`;
      context += `  Description: ${assignment.description}\n`;
      context += `  Deadline: ${deadline.toLocaleDateString('en-GB')} ${deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
      context += `  Status: ${assignment.submissionStatus || 'Not Submitted'}\n`;
      context += `  Urgency: ${urgency}\n`;
      context += `  Total Marks: ${assignment.totalMarks}\n\n`;
    });
  }

  context += `Attendance Records:\n`;
  if (attendance.length === 0) {
    context += `No attendance data available.\n`;
  } else {
    attendance.forEach(record => {
      const percentage = parseFloat(record.percentage);
      let status = 'Safe';
      if (percentage < 75) status = 'Risk';
      else if (percentage < 85) status = 'Warning';

      context += `• ${record.subject.name} (${record.subject.code})\n`;
      context += `  Attendance: ${record.percentage}%\n`;
      context += `  Present: ${record.present} | Absent: ${record.absent} | Late: ${record.late}\n`;
      context += `  Status: ${status}\n\n`;
    });
  }

  context += `Recent Announcements (${announcements.length}):\n`;
  if (announcements.length === 0) {
    context += `No announcements available.\n`;
  } else {
    announcements.forEach(announcement => {
      const date = new Date(announcement.createdAt);
      context += `• ${announcement.title}\n`;
      context += `  Priority: ${announcement.priority}\n`;
      context += `  Subject: ${announcement.subject?.name || 'General'}\n`;
      context += `  Date: ${date.toLocaleDateString('en-GB')}\n`;
      context += `  Content: ${announcement.content}\n\n`;
    });
  }

  context += `\n=== END CONTEXT ===\n\n`;
  
  return context;
};

const chatWithAI = async (userMessage, studentData, conversationHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = formatStudentContext(studentData);
    
    const fullPrompt = SYSTEM_PROMPT + context + `\nStudent Question: ${userMessage}\n\nProvide a helpful response based on the student's actual data above. Use the mandatory response format when listing tasks.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      message: 'I apologize, but I encountered an error processing your request. Please try again.',
      error: error.message
    };
  }
};

const getQuickInsights = async (studentData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = formatStudentContext(studentData);
    
    const prompt = SYSTEM_PROMPT + context + `\n\nProvide a quick academic status summary for this student. Include:
1. Most urgent tasks (if any)
2. Attendance warnings (if any)
3. Important announcements (if any)
4. Overall status

Keep it concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      insights: text
    };
  } catch (error) {
    console.error('AI Insights Error:', error);
    return {
      success: false,
      insights: 'Unable to generate insights at this time.'
    };
  }
};

module.exports = {
  chatWithAI,
  getQuickInsights
};
