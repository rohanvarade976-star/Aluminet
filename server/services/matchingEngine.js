/**
 * AlumiNet Matching Engine
 * 
 * Computes deterministic multi-attribute compatibility scores between a student and prospective alumni mentors.
 * 
 * Scoring Formula:
 * - Technical Skills Coverage (60% weight): (|Common Skills| / |Student Target Skills|) * 60
 * - Domain & Career Interests (40% weight): (|Common Interests| / |Student Target Interests|) * 40
 * - Minimum Cutoff Threshold: >= 70% (lower-compatibility candidates are filtered out)
 * 
 * @param {Object} student - Active student user document with skills and interests arrays
 * @param {Array<Object>} mentors - Collection of alumni mentor documents
 * @returns {Array<Object>} Sorted list of top matching mentors scoring >= 70%
 */
function matchMentors(student, mentors) {
  const results = mentors.map(m => {
    let score = 0;
    
    // 1. Common Skills (60% weight)
    const studentSkills = (student.skills || []).map(s => s.toLowerCase().trim());
    const mentorSkills = (m.skills || []).map(s => s.toLowerCase().trim());
    const commonSkills = studentSkills.filter(s => mentorSkills.includes(s));
    
    if (studentSkills.length > 0) {
      score += (commonSkills.length / studentSkills.length) * 60;
    }

    // 2. Common Interests (40% weight)
    const studentInterests = (student.interests || []).map(s => s.toLowerCase().trim());
    const mentorInterests = (m.interests || []).map(s => s.toLowerCase().trim());
    const commonInterests = studentInterests.filter(s => mentorInterests.includes(s));
    
    if (studentInterests.length > 0) {
      score += (commonInterests.length / studentInterests.length) * 40;
    }

    return {
      mentor: {
        _id: m._id, name: m.name, avatar: m.avatar,
        department: m.department, currentCompany: m.currentCompany,
        currentRole: m.currentRole, skills: m.skills, bio: m.bio,
        location: m.location, graduationYear: m.graduationYear
      },
      matchScore: Math.min(Math.round(score), 99),
      commonSkills: (student.skills || []).filter(s =>
        (m.skills || []).map(x => x.toLowerCase()).includes(s.toLowerCase())
      ),
      commonInterests: (student.interests || []).filter(s =>
        (m.interests || []).map(x => x.toLowerCase()).includes(s.toLowerCase())
      )
    };
  }).filter(m => m.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return results;
}

module.exports = { matchMentors };
