require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const USERS = [
  { name:'Admin User',    email:'admin@demo.com',   password:'demo123', role:'admin',   isVerified:true, department:'Computer Engineering', skills:['management'], points:0 },
  { name:'Priya Sharma',  email:'student@demo.com', password:'demo123', role:'student', isVerified:true, department:'Computer Engineering', verificationStatus:'approved', bio:'Final year CE student passionate about AI/ML and full-stack development.', skills:['Python','React','Machine Learning','Node.js'], interests:['AI','Web Development','Data Science'], graduationYear:2025, points:35 },
  { name:'Rahul Mehta',   email:'alumni@demo.com',  password:'demo123', role:'alumni',  isVerified:true, department:'Computer Engineering', verificationStatus:'approved', bio:'Senior Software Engineer at Google with 5 years in backend systems and distributed computing.', skills:['Python','Go','Kubernetes','Machine Learning','System Design'], interests:['AI','Cloud','Open Source'], graduationYear:2019, currentRole:'Senior Software Engineer', currentCompany:'Google', location:'Bangalore, India', linkedIn:'https://linkedin.com/in/rahulmehta', points:120 },
  { name:'Anjali Patel',  email:'anjali@demo.com',  password:'demo123', role:'alumni',  isVerified:true, department:'Information Technology', verificationStatus:'approved', bio:'Product Manager at Microsoft helping teams ship impactful features.', skills:['Product Management','Agile','React','Data Analysis','UX Design'], interests:['Product','Startups','Design'], graduationYear:2018, currentRole:'Product Manager', currentCompany:'Microsoft', location:'Pune, India', points:95 },
  { name:'Vikram Singh',  email:'vikram@demo.com',  password:'demo123', role:'alumni',  isVerified:true, department:'Electronics Engineering', verificationStatus:'approved', bio:'Founder of a fintech startup. Love mentoring students about entrepreneurship.', skills:['Entrepreneurship','Python','AWS','Finance','Leadership'], interests:['Fintech','Startups','AI'], graduationYear:2016, currentRole:'Founder & CEO', currentCompany:'PayEasy Technologies', location:'Mumbai, India', points:200 },
  { name:'Neha Kapoor',   email:'neha@demo.com',    password:'demo123', role:'student', isVerified:true, department:'Information Technology', verificationStatus:'approved', bio:'Interested in cybersecurity and cloud computing.', skills:['Java','Python','Linux','Networking'], interests:['Cybersecurity','Cloud','DevOps'], graduationYear:2025, points:20 },
];

const seed = async () => {
  await connectDB();
  const User = require('./models/User');
  const ForumPost = require('./models/ForumPost');
  const Event = require('./models/Event');
  const JobPosting = require('./models/JobPosting');
  const StudyGroup = require('./models/StudyGroup');
  const Achievement = require('./models/Achievement');

  await Promise.all([User,ForumPost,Event,JobPosting,StudyGroup,Achievement].map(M => M.deleteMany({})));
  console.log('🗑️  Cleared existing data');

  const created = [];
  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 12);
    const user = await User.create({ ...u, password: hashed });
    created.push(user);
  }
  console.log(`👥 Created ${created.length} users`);

  const [admin, student, alumni1, alumni2, alumni3, student2] = created;

  // Forum posts
  await ForumPost.insertMany([
    { title:'How to crack Google interviews? Advice from a Googler', content:'Having gone through the process myself, here are my top tips...', author:alumni1._id, category:'career', tags:['google','interview','career'], isPinned:true },
    { title:'Best resources to learn System Design in 2025', content:'System Design is crucial for senior roles. Here are the best resources...', author:alumni1._id, category:'technical', tags:['system-design','backend'] },
    { title:'From college to startup founder - my journey', content:'I started my company 6 months after graduating...', author:alumni3._id, category:'career', tags:['startup','entrepreneurship'] },
    { title:'Best final year project ideas for CE students', content:'Looking for project ideas? Here are some trending ones...', author:student._id, category:'campus', tags:['project','final-year'] },
  ]);
  console.log('💬 Created forum posts');

  // Events
  await Event.insertMany([
    { title:"Career in Big Tech - A Googler's Perspective", description:'Join Rahul Mehta as he shares tips for landing at top tech companies.', type:'webinar', host:alumni1._id, speakers:[alumni1._id], scheduledAt:new Date(Date.now()+3*86400000), duration:90, meetLink:'https://meet.google.com/abc-defg-hij', tags:['career','google'], isPublished:true, maxAttendees:100 },
    { title:'Product Management 101 for Engineers', description:'Anjali Patel walks through how engineers can transition into PM roles.', type:'workshop', host:alumni2._id, speakers:[alumni2._id], scheduledAt:new Date(Date.now()+7*86400000), duration:60, tags:['product','management'], isPublished:true, maxAttendees:50 },
    { title:'Building a Startup from Scratch', description:'Vikram Singh shares the realities of founding a startup.', type:'talk', host:alumni3._id, speakers:[alumni3._id], scheduledAt:new Date(Date.now()+14*86400000), duration:75, tags:['startup','entrepreneurship'], isPublished:true, maxAttendees:200 },
  ]);
  console.log('📅 Created events');

  // Jobs
  await JobPosting.insertMany([
    { postedBy:alumni1._id, title:'Software Engineer - Backend', company:'Google', location:'Bangalore / Remote', type:'full-time', experienceLevel:'fresher', description:'Join our backend team building large-scale distributed systems.', requirements:['B.Tech in CS/IT','Strong DSA skills','Experience with Python or Go'], skills:['Python','Go','Distributed Systems','Kubernetes'], salary:'₹18-25 LPA', applyLink:'https://careers.google.com', department:'Computer Engineering', isActive:true },
    { postedBy:alumni2._id, title:'Product Management Intern', company:'Microsoft', location:'Hyderabad', type:'internship', experienceLevel:'fresher', description:'6-month PM internship with full-time conversion opportunity.', requirements:['Pre-final or Final year student','Strong communication','Analytical mindset'], skills:['Product Thinking','Data Analysis','Agile','Communication'], salary:'₹60,000/month', applyEmail:'pm-intern@microsoft.com', department:'Information Technology', isActive:true },
    { postedBy:alumni3._id, title:'Full Stack Developer', company:'PayEasy Technologies', location:'Mumbai / Remote', type:'full-time', experienceLevel:'junior', description:'Build the future of payments with our fast-growing fintech startup.', requirements:['1-2 years experience','React and Node.js expertise','Interest in fintech'], skills:['React','Node.js','MongoDB','Redis','TypeScript'], salary:'₹8-14 LPA', applyEmail:'careers@payeasy.in', isActive:true },
  ]);
  console.log('💼 Created job postings');

  // Study Groups
  await StudyGroup.insertMany([
    { name:'DBMS Exam Prep 2025', description:'Preparing for Database Management Systems exam together', subject:'Database Management Systems', creator:student._id, members:[student._id, student2._id], maxMembers:10, tags:['dbms','sql','exam'], schedule:'Weekdays 7-9 PM', department:'Computer Engineering', isPublic:true },
    { name:'ML Study Circle', description:'Weekly sessions on Machine Learning concepts and projects', subject:'Machine Learning', creator:student._id, members:[student._id], maxMembers:8, tags:['ml','python','ai'], schedule:'Saturdays 3-5 PM', isPublic:true },
    { name:'DSA Interview Prep', description:'Cracking coding interviews together with daily problems', subject:'Data Structures & Algorithms', creator:student2._id, members:[student2._id], maxMembers:12, tags:['dsa','leetcode','interview'], schedule:'Daily 8-9 PM', isPublic:true },
  ]);
  console.log('📚 Created study groups');

  // Achievements for demo users
  const achData = [
    { user:student._id, type:'first_login', title:'First Steps', description:'Logged in for first time', icon:'👋', points:10 },
    { user:student._id, type:'profile_complete', title:'Profile Pro', description:'Completed profile', icon:'✨', points:25 },
    { user:alumni1._id, type:'verified', title:'Verified Member', description:'Account verified', icon:'✅', points:50 },
    { user:alumni3._id, type:'event_host', title:'Event Host', description:'Hosted first event', icon:'🎤', points:60 },
  ];
  await Achievement.insertMany(achData);
  console.log('🏆 Created achievements');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo Login Credentials:');
  console.log('  Student  : student@demo.com / demo123');
  console.log('  Alumni   : alumni@demo.com  / demo123');
  console.log('  Admin    : admin@demo.com   / demo123');
  console.log('\n🤖 AI powered by Groq (llama3-70b-8192) - Fast & Free!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
