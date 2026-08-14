/** Page titles for the app shell top bar */
const ROUTES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview' },
  '/mentors': { title: 'Find Alumni', subtitle: 'AI-powered matching' },
  '/sessions': { title: 'My Sessions', subtitle: 'Mentorship' },
  '/events': { title: 'Events', subtitle: 'Webinars & talks' },
  '/events/create': { title: 'Create Event', subtitle: 'Host for community' },
  '/forum': { title: 'Forum', subtitle: 'Community discussions' },
  '/chat': { title: 'Live Chat', subtitle: 'Real-time messages' },
  '/study-groups': { title: 'Study Groups', subtitle: 'Collaborate' },
  '/jobs': { title: 'Job Board', subtitle: 'Opportunities' },
  '/ai-jobs': { title: 'AI Job Match', subtitle: 'Personalized recommendations' },
  '/resume': { title: 'Resume Analyzer', subtitle: 'AI feedback' },
  '/verify': { title: 'Verification', subtitle: 'Account trust' },
  '/admin/verify': { title: 'Verifications', subtitle: 'Admin queue' },
  '/notifications': { title: 'Notifications', subtitle: 'Updates' },
  '/achievements': { title: 'Achievements', subtitle: 'Points & badges' },
  '/profile/edit': { title: 'Edit Profile', subtitle: 'Your details' },
};

export function getRouteMeta(pathname) {
  if (ROUTES[pathname]) return ROUTES[pathname];

  if (pathname.startsWith('/events/')) return { title: 'Event Details', subtitle: 'Events' };
  if (pathname.startsWith('/forum/')) return { title: 'Discussion', subtitle: 'Forum' };
  if (pathname.startsWith('/chat/')) return { title: 'Chat Room', subtitle: 'Live Chat' };
  if (pathname.startsWith('/profile/')) return { title: 'Profile', subtitle: 'Member' };

  return { title: 'AlumiNet', subtitle: '' };
}
