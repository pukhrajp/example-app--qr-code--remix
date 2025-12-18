# Collaboration Strategy - Building Custom Cursor App
## Human + AI Development Approach

**Document Version:** 1.0  
**Last Updated:** December 18, 2025  
**Project:** Custom Cursor Shopify App  
**Timeline:** 9 weeks to MVP

---

## 🎯 Executive Summary

This document outlines our collaboration strategy to build the Custom Cursor app efficiently using AI-assisted development. By following this approach, we can **reduce development time by 40-60%** while maintaining high quality and accuracy.

### Key Principles
1. **Iterative Development** - Build in small, testable increments
2. **Clear Communication** - Explicit requirements and feedback
3. **AI-First Tasks** - Leverage AI for boilerplate, patterns, documentation
4. **Human-First Decisions** - You make strategic and UX decisions
5. **Continuous Testing** - Test after every significant change

---

## 🤝 Roles & Responsibilities

### Your Role (Human Developer/Product Owner)

#### Strategic Decisions
- ✅ **Feature prioritization** - What to build next
- ✅ **UX decisions** - User flow and interface choices
- ✅ **Business logic** - Core app behavior rules
- ✅ **Quality standards** - Acceptance criteria
- ✅ **Testing validation** - Verify features work correctly

#### Execution Tasks
- ✅ **Code review** - Review AI-generated code
- ✅ **Manual testing** - Test app in browser/Shopify admin
- ✅ **Bug reporting** - Report issues clearly with steps to reproduce
- ✅ **Feedback** - Provide clear feedback on generated code
- ✅ **Final decisions** - Approve or reject implementations

#### What You Should NOT Do
- ❌ Write boilerplate code manually
- ❌ Search documentation extensively (let AI do it)
- ❌ Format code manually
- ❌ Write extensive documentation alone
- ❌ Debug simple syntax errors (AI can help)

### My Role (AI Assistant)

#### Code Generation
- ✅ **Full feature implementation** - Complete, working code
- ✅ **Database schemas** - Prisma models and migrations
- ✅ **API routes** - Remix loaders and actions
- ✅ **UI components** - Polaris-based interfaces
- ✅ **Utilities** - Helper functions and modules

#### Technical Tasks
- ✅ **Research** - Look up best practices and patterns
- ✅ **Documentation** - Write clear comments and docs
- ✅ **Debugging** - Identify and fix issues
- ✅ **Optimization** - Improve performance
- ✅ **Testing code** - Write test cases

#### What I Cannot Do
- ❌ Make business decisions for you
- ❌ Test in actual browser (you must do this)
- ❌ Access external systems (except documentation)
- ❌ Make subjective UX decisions
- ❌ Deploy to production (you initiate)

---

## 🏗️ Development Methodology

### Approach: Agile Micro-Iterations

We'll use **2-3 hour development sprints** with this cycle:

```
1. PLAN (5-10 min)
   ↓
2. BUILD (60-90 min)
   ↓
3. TEST (15-30 min)
   ↓
4. REVIEW (10-15 min)
   ↓
5. ITERATE or NEXT
```

### Sprint Structure

#### Sprint 1: Foundation (Day 1)
**Goal:** Project setup and basic structure

**Tasks:**
1. Database schema setup
2. Basic admin dashboard
3. Authentication flow
4. First route working

**Your Part:** Test app installs and loads

#### Sprint 2-4: Cursor Gallery (Days 2-4)
**Goal:** Display and select pre-made cursors

**Tasks:**
1. Cursor model and seed data
2. Gallery UI component
3. Selection logic
4. Preview system

**Your Part:** Test cursor selection, verify UI looks good

#### Sprint 5-7: Activation System (Days 5-7)
**Goal:** Apply cursor to storefront

**Tasks:**
1. Theme app extension
2. Script injection for legacy themes
3. Activation/deactivation logic
4. Storefront testing

**Your Part:** Test on actual Shopify store, verify cursor appears

#### Sprint 8-10: Custom Upload (Days 8-10)
**Goal:** Upload custom cursors

**Tasks:**
1. File upload component
2. Image validation
3. Storage integration
4. Preview uploaded cursor

**Your Part:** Test file upload, try different formats

### And so on...

---

## 💬 Communication Protocols

### How to Request Features

#### ✅ GOOD Request Format
```
Feature: Display cursor gallery

Requirements:
- Show 30 cursors in a grid
- 5 columns on desktop, 2 on mobile
- Each cursor shows: image preview, name, category
- Click to select cursor
- Show "Active" badge on current cursor

Acceptance Criteria:
- [ ] Gallery loads in <2 seconds
- [ ] Cursors are clickable
- [ ] Active cursor is highlighted
- [ ] Mobile responsive

Context:
- Use Shopify Polaris components
- Data should come from database
- Follow existing code patterns
```

#### ❌ BAD Request Format
```
"Build the cursor gallery"
```
**Problem:** Too vague, missing requirements

```
"Create a gallery page with cursors displayed nicely and 
make sure it works on mobile and has good performance and 
uses the right components and follows best practices..."
```
**Problem:** Too much in one request, unclear priorities

### Request Template

Use this template for feature requests:

```markdown
## Feature: [Feature Name]

### Goal
[What should this accomplish?]

### Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

### Acceptance Criteria
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]

### Technical Notes
- [Any specific technical requirements]
- [Patterns to follow]
- [Dependencies]

### Files to Modify/Create
- [File 1]
- [File 2]

### Context
[Any additional information I should know]
```

---

## 🚀 Efficient Collaboration Patterns

### Pattern 1: Feature-First Development

**How It Works:**
1. You specify ONE feature clearly
2. I implement it completely
3. You test it immediately
4. We fix issues before moving on

**Example:**
```
You: "Add cursor selection to gallery"
Me: [Implements complete feature with code]
You: [Tests] "Works! But selection highlight is too subtle"
Me: [Adjusts CSS]
You: "Perfect! Next feature: preview system"
```

### Pattern 2: Parallel Development

**How It Works:**
Some tasks can be done in parallel:

```
Session 1 (Morning):
You: "Implement features A, B, C"
Me: [Generates all three]
You: Test A → [feedback] → I fix
     Test B → [feedback] → I fix
     Test C → [feedback] → I fix

Session 2 (Afternoon):
Continue with next batch
```

### Pattern 3: Batch Similar Tasks

**How It Works:**
Group similar work together:

```
✅ GOOD: "Create all database models for MVP"
✅ GOOD: "Implement all gallery UI components"
✅ GOOD: "Write tests for cursor upload feature"

❌ BAD: Jumping between database, UI, tests randomly
```

### Pattern 4: Reference Existing Code

**How It Works:**
Point me to existing patterns:

```
You: "Create cursor upload similar to how QRCode upload 
works in app/routes/app.qrcodes.$id.jsx but for cursors"

Me: [Analyzes existing code, applies pattern]
```

This is **10x faster** than explaining from scratch.

---

## 🎯 Task Prioritization Framework

### Priority Levels

#### P0: Critical Path (Do First)
- Core functionality required for app to work
- Blocking other features
- Essential for MVP

**Example P0 Tasks:**
- Database schema
- Basic admin dashboard
- Cursor activation system
- App installation flow

#### P1: High Value (Do Next)
- Important features users will use frequently
- Differentiators from competitors
- High user value

**Example P1 Tasks:**
- Cursor gallery with 30+ cursors
- Custom upload
- Preview system
- Settings page

#### P2: Nice to Have (Do Later)
- Polish and improvements
- Non-critical features
- Future enhancements

**Example P2 Tasks:**
- Advanced hotspot configuration
- Analytics
- Multiple cursors
- Seasonal automation

#### P3: Future (Post-MVP)
- Can wait until after launch
- Based on user feedback

**Example P3 Tasks:**
- AI cursor generator
- Cursor marketplace
- 3D cursors

### Daily Priority Example

```
Day 3 Priority List:

P0 (Must Do Today):
1. Fix cursor not appearing on storefront [Bug]
2. Implement cursor activation logic

P1 (Should Do Today):
3. Add 10 more cursors to gallery
4. Improve gallery UI layout

P2 (Nice to Do):
5. Add loading animations
6. Write user documentation

P3 (Can Wait):
7. Add analytics tracking
```

---

## 🔄 Iteration Workflow

### Standard Iteration Cycle

#### Step 1: Planning (You)
```
You define:
- Feature name
- User story
- Acceptance criteria
- Priority level
```

#### Step 2: Implementation (Me)
```
I provide:
- Complete working code
- Necessary file changes
- Migration scripts (if needed)
- Brief explanation
```

#### Step 3: Testing (You)
```
You verify:
- Feature works as expected
- No breaking changes
- UI looks good
- Performance acceptable
```

#### Step 4: Feedback (You)
```
You report:
- ✅ Works perfectly - move on
- ⚠️ Works but needs tweaks - specify changes
- ❌ Doesn't work - provide error details
```

#### Step 5: Refinement (Me)
```
I adjust:
- Fix bugs
- Refine based on feedback
- Optimize if needed
```

### Example Complete Iteration

```
[YOU - 9:00 AM]
"Implement cursor gallery page at /app/cursors with grid 
layout showing cursor name, image, and category. Use 
IndexTable from Polaris."

[ME - 9:05 AM]
[Generates complete code for route, component, loader]

[YOU - 9:20 AM]
"Tested - works but images are too large. Make them 64x64px 
and add spacing between items."

[ME - 9:22 AM]
[Adjusts CSS]

[YOU - 9:25 AM]
"Perfect! Next: add click handler to select cursor"

[ME - 9:30 AM]
[Implements selection logic]

[YOU - 9:40 AM]
"Works great! Moving to next feature..."
```

**Time for Complete Feature:** 40 minutes ✅

---

## 🛠️ Optimal Task Sizes

### Perfect Task Size: 30-90 Minutes

#### Too Small (< 15 minutes)
```
❌ "Add a button"
❌ "Change text color"
❌ "Fix typo"
```
**Problem:** Too granular, overhead outweighs benefit

#### Just Right (30-90 minutes)
```
✅ "Create cursor gallery page with selection"
✅ "Implement file upload with validation"
✅ "Add settings page with enable/disable toggle"
```
**Sweet Spot:** Complete feature, testable, clear scope

#### Too Large (> 3 hours)
```
❌ "Build entire cursor management system"
❌ "Implement all admin features"
❌ "Complete MVP"
```
**Problem:** Too broad, hard to test, unclear requirements

### Breaking Down Large Tasks

**Large Task:** "Complete cursor upload feature"

**Break Into:**
1. ✅ Create upload UI component (45 min)
2. ✅ Implement file validation (30 min)
3. ✅ Add storage integration (60 min)
4. ✅ Create preview system (45 min)
5. ✅ Handle errors and edge cases (30 min)

**Total:** 5 testable chunks instead of 1 large task

---

## 📝 Best Practices for Requests

### DO's ✅

#### 1. Be Specific
```
✅ "Add a banner at top of dashboard showing currently 
active cursor with name, thumbnail, and 'Change' button"

Instead of:
❌ "Show current cursor somewhere"
```

#### 2. Provide Context
```
✅ "Following the pattern in app/routes/app.qrcodes.$id.jsx, 
create a similar form for cursor settings at 
app/routes/app.settings.jsx"

Instead of:
❌ "Make a settings page"
```

#### 3. Include Examples
```
✅ "Layout should look like this:
┌─────────────────────┐
│ Cursor Gallery      │
├─────────────────────┤
│ [🖱️] [🖱️] [🖱️] [🖱️] │
│ [🖱️] [🖱️] [🖱️] [🖱️] │
└─────────────────────┘"

Instead of:
❌ "Make a grid"
```

#### 4. Specify Constraints
```
✅ "Image upload must:
- Accept only PNG, JPG, SVG
- Max size 2MB
- Min dimensions 16x16px
- Max dimensions 128x128px
- Show error for invalid files"

Instead of:
❌ "Validate uploaded images"
```

#### 5. Define Success
```
✅ "Feature is complete when:
- [ ] User can select a cursor from gallery
- [ ] Selected cursor shows visual highlight
- [ ] 'Apply' button saves selection
- [ ] Selection persists on page reload
- [ ] Works on mobile"

Instead of:
❌ "Make cursor selection work"
```

### DON'Ts ❌

#### 1. Don't Assume I Know Your Intent
```
❌ "Fix the cursor thing"
✅ "Fix the issue where cursor doesn't apply on collection pages"
```

#### 2. Don't Combine Unrelated Tasks
```
❌ "Add cursor upload and also fix the menu bug and improve 
performance and update documentation"

✅ Separate into 4 different requests
```

#### 3. Don't Skip Acceptance Criteria
```
❌ "Build the feature well"
✅ Provide specific, testable criteria
```

#### 4. Don't Use Vague Adjectives
```
❌ "Make it look nice"
✅ "Use Polaris Card with 16px padding, BlockStack spacing 
of 400, and primary button variant"
```

---

## 🐛 Bug Reporting Template

### Effective Bug Reports

```markdown
## Bug: [Short Description]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Error Messages
```
[Paste exact error message]
```

### Environment
- Browser: [Chrome 120]
- OS: [Windows 11]
- App Version: [Current git commit or date]

### Screenshots
[Attach if relevant]

### Impact
- [ ] Blocks development
- [ ] Breaks existing feature
- [ ] Minor issue
```

### Example Bug Report

```markdown
## Bug: Cursor not applying on product pages

### Expected Behavior
Selected cursor should appear on all store pages including 
product pages.

### Actual Behavior
Cursor appears on home page but reverts to default on 
product pages.

### Steps to Reproduce
1. Install app in development store
2. Select "Sparkle Purple" cursor
3. Click "Activate"
4. Visit home page - cursor works ✅
5. Visit any product page - cursor doesn't work ❌

### Error Messages
None in console

### Environment
- Browser: Chrome 120
- OS: Windows 11
- Theme: Dawn 12.0.0

### Impact
- [x] Blocks development (core feature broken)
```

---

## ⚡ Speed Optimization Techniques

### Technique 1: Batch Code Reviews

**Instead of:**
```
Request feature A → Review → Request B → Review → Request C → Review
(6 context switches)
```

**Do this:**
```
Request features A, B, C → Review all three → Provide feedback on all
(2 context switches - 3x faster)
```

### Technique 2: Prepared Questions

**Keep a running list:**
```
Today's Questions:
1. Should cursor work on checkout page?
2. Max custom cursors per user?
3. Mobile cursor behavior?
4. Default cursor when none selected?
```

**Then ask in batch:**
"Quick decisions needed on these 4 points..."

### Technique 3: Use TODO Comments

**While testing, add TODOs:**
```javascript
// TODO: Add loading state while cursor image loads
// TODO: Show error if cursor fails to apply
// TODO: Add confirmation before deleting custom cursor
```

**Then:** "Implement all TODOs in cursor gallery file"

### Technique 4: Reference, Don't Explain

**Slow:**
"I need a form with text field for title, another for description, 
a dropdown for category, and a submit button that validates..."

**Fast:**
"Create form like app.qrcodes.$id.jsx but for cursor metadata"

### Technique 5: Accept "Good Enough" for MVP

**MVP Philosophy:**
```
✅ Works reliably
✅ Handles happy path
✅ Basic error handling
❌ Perfect pixel-perfect design
❌ Every edge case
❌ Advanced optimizations
```

**After MVP:**
Then we polish and optimize.

---

## 📅 Weekly Planning Structure

### Monday: Planning Week
```
Morning (30 min):
- Review last week's progress
- Prioritize this week's features
- Create task list

Afternoon:
- Start highest priority feature
```

### Tuesday-Thursday: Building
```
Focus Mode:
- 3-4 features per day
- Test each immediately
- Fix issues before moving on
- No context switching
```

### Friday: Polish & Review
```
Morning:
- Fix remaining bugs
- Polish UI/UX
- Test integration

Afternoon:
- Update documentation
- Plan next week
- Deploy if ready
```

---

## 🎯 Daily Workflow Template

### Morning Session (2-3 hours)

```
1. Review (10 min)
   - What did we build yesterday?
   - Any issues from testing?
   - Today's priorities

2. Build Sprint 1 (90 min)
   You: Define feature + acceptance criteria
   Me: Implement
   You: Test
   Me: Fix issues

3. Build Sprint 2 (60 min)
   [Repeat for next feature]
```

### Afternoon Session (2-3 hours)

```
1. Build Sprint 3 (60 min)
2. Build Sprint 4 (60 min)
3. Integration Testing (30 min)
4. Tomorrow Planning (15 min)
```

### Evening (Optional)
```
- Manual testing in actual Shopify store
- Note bugs/issues for tomorrow
- Think about UX improvements
```

---

## 🔍 Quality Assurance Approach

### Three-Level Testing

#### Level 1: AI-Assisted (Me)
```
✅ Syntax errors
✅ Type checking
✅ Basic logic errors
✅ Code style
✅ Best practices
```

#### Level 2: Human Testing (You)
```
✅ Feature works as intended
✅ UI looks good
✅ User flow makes sense
✅ Edge cases
✅ Integration with other features
```

#### Level 3: Real-World (You)
```
✅ Test in development store
✅ Test on different devices
✅ Test with real data
✅ Performance testing
✅ Theme compatibility
```

### Testing Checklist Template

After implementing each feature:

```markdown
## Feature: [Name]

### Functional Testing
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Edge cases considered
- [ ] Data persists correctly

### UI/UX Testing
- [ ] Layout looks good on desktop
- [ ] Responsive on mobile
- [ ] Polaris components used correctly
- [ ] Loading states shown
- [ ] Error messages clear

### Integration Testing
- [ ] Works with existing features
- [ ] No breaking changes
- [ ] Database operations correct
- [ ] API calls succeed

### Performance Testing
- [ ] Page loads quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images optimized
```

---

## 🚨 When Things Go Wrong

### Handling Blockers

#### Type 1: Technical Blocker
```
You: "Feature X doesn't work - getting error Y"

Best Approach:
1. Copy full error message
2. Describe what you did
3. Share relevant code
4. I debug and fix
```

#### Type 2: Unclear Requirements
```
Me: "To implement this, I need to know: [Question]"

Best Approach:
1. You provide quick decision
2. We document it
3. Continue building
4. Revisit later if needed
```

#### Type 3: Performance Issue
```
You: "Page is slow after adding feature X"

Best Approach:
1. Measure (Lighthouse, Network tab)
2. Identify bottleneck
3. I optimize specific issue
4. Re-measure to confirm
```

### Escalation Protocol

```
Level 1: Quick Fix (< 15 min)
→ Just mention it, I fix immediately

Level 2: Needs Investigation (15-60 min)
→ Create bug report, I debug systematically

Level 3: Major Issue (> 1 hour)
→ Consider alternative approach or workaround
```

---

## 📊 Progress Tracking

### Daily Metrics

Track these each day:
```
Date: [Dec 18, 2025]

✅ Completed:
- Feature A
- Feature B
- Bug fix C

⏳ In Progress:
- Feature D (70% done)

🐛 Bugs Found:
- Issue E (P0 - blocking)
- Issue F (P2 - minor)

⏱️ Time Spent:
- Planning: 20 min
- Building: 3.5 hours
- Testing: 1 hour
- Fixing: 30 min

📈 Progress:
- MVP: 25% complete
- Week 1: Day 3 of 5
```

### Weekly Review

Every Friday:
```
Week [1] Review:

Completed Features: [List]
Bugs Fixed: [Count]
New Bugs: [Count]
Code Quality: [✅ Good / ⚠️ Needs work]

Next Week Focus:
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

Blockers:
[Any issues that need attention]

Adjustments Needed:
[Any changes to approach]
```

---

## 🎓 Learning & Improvement

### Continuous Improvement

#### After Each Sprint:
```
What worked well?
What slowed us down?
What should we change?
```

#### After Each Week:
```
Are we on track?
Quality acceptable?
Need to adjust priorities?
Need to change approach?
```

### Knowledge Building

```
Create docs/knowledge/ folder:

- cursor-implementation-notes.md
- shopify-api-learnings.md
- performance-tips.md
- bug-solutions.md
```

**Why?** Save time on recurring issues

---

## 🎯 Success Metrics for Collaboration

### Velocity Metrics
- **Features per day:** Target 3-5 small features
- **Bug fix time:** Target <1 hour for most bugs
- **Code review time:** Target <15 min per feature
- **Context switch time:** Target <5 min between tasks

### Quality Metrics
- **First-time success rate:** Target >70%
- **Bug introduction rate:** Target <2 per feature
- **Code rewrite rate:** Target <20%
- **Performance degradation:** Target 0

### Efficiency Metrics
- **Time to working code:** Target <30 min per feature
- **Time to tested code:** Target <60 min per feature
- **Daily progress:** Target 10-15% of weekly goal

---

## 🚀 Quick Start Guide

### Your First Day with This Strategy

#### Hour 1: Setup
```
1. Review this document (15 min)
2. Review PRD and feature list (15 min)
3. Set up development environment (30 min)
```

#### Hour 2-3: First Feature
```
1. Pick highest priority feature
2. Write clear requirements (10 min)
3. Request implementation from me (5 min)
4. I implement (30 min)
5. You test (15 min)
6. We iterate (20 min)
7. Move to next feature
```

#### Hour 4-6: Build Momentum
```
Repeat feature cycle 2-3 more times
End day with 3-4 working features
```

---

## 📋 Template Collection

### Feature Request Template
```markdown
## Feature: [Name]
Priority: [P0/P1/P2/P3]
Time Estimate: [30min/60min/90min]

### Requirements
- [Req 1]
- [Req 2]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Technical Details
- Files: [List]
- Dependencies: [List]
- Patterns to follow: [Reference]
```

### Bug Report Template
```markdown
## Bug: [Description]
Priority: [P0/P1/P2]

### Expected vs Actual
Expected: [What should happen]
Actual: [What happens]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]

### Error: [Paste error]
```

### Daily Standup Template
```markdown
## Daily Update - [Date]

### Yesterday
- Completed: [List]
- Bugs: [Count fixed]

### Today
- Plan: [List features]
- Priority: [Main focus]

### Blockers
- [Any issues]
```

---

## 🎯 Final Tips for Success

### 1. **Start Small**
Don't try to build everything at once. One feature at a time.

### 2. **Test Immediately**
Don't accumulate untested code. Test after each feature.

### 3. **Communicate Clearly**
5 minutes writing clear requirements saves 30 minutes of rework.

### 4. **Stay Focused**
Resist urge to jump between features. Finish one first.

### 5. **Accept Iteration**
First version doesn't need to be perfect. Make it work, then make it better.

### 6. **Document Decisions**
Write down important decisions for future reference.

### 7. **Celebrate Progress**
Acknowledge completed features. Momentum is motivating.

### 8. **Ask Questions**
If requirements are unclear, ask immediately. Don't guess.

### 9. **Trust the Process**
This methodology works. Give it at least 3-4 days to prove itself.

### 10. **Have Fun**
Building should be enjoyable. If it's not, let's adjust our approach.

---

## 🎬 Let's Get Started!

### Next Immediate Steps:

1. **Review this document** (15 min)
2. **Choose first feature** from PRD (5 min)
3. **Write feature request** using template (10 min)
4. **Share with me** - let's build it!

---

## 📞 Quick Reference

### When you need me to:

**Write code:**
"Implement [feature] with [requirements]"

**Fix bugs:**
"Fix [issue] - [error message] - [steps to reproduce]"

**Review code:**
"Review [files] for [quality/performance/security]"

**Explain:**
"Explain how [concept] works in this codebase"

**Research:**
"Find best approach for [problem]"

**Optimize:**
"Optimize [feature] for [performance/memory/size]"

**Document:**
"Document [feature] with [usage examples]"

**Refactor:**
"Refactor [code] to [improvement]"

---

**Ready to build faster and smarter? Let's start with Feature #1!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2025  
**Next Review:** After Week 1 completion

**Questions about this strategy? Ask me anytime!**

