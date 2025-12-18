# AI Collaboration Cheat Sheet
## Quick Reference for Efficient Development

**Keep this handy while building!** 📌

---

## 🎯 Golden Rules

1. **One feature at a time** - Finish before moving to next
2. **Test immediately** - Don't accumulate untested code
3. **Be specific** - Vague requests = vague results
4. **Provide context** - Reference existing code patterns
5. **Define success** - Clear acceptance criteria

---

## ✅ Request Templates

### Feature Request (Copy & Customize)
```
Feature: [Name]
Priority: P[0-3]

Requirements:
- [Requirement 1]
- [Requirement 2]

Acceptance Criteria:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

Technical: Follow pattern from [file.jsx]

Build it!
```

### Bug Report (Copy & Customize)
```
Bug: [Description]

Expected: [Should do X]
Actual: [Does Y]

Steps:
1. [Do this]
2. [Then this]
3. [Bug appears]

Error: [Paste error]

Fix please!
```

### Quick Request (One-liner)
```
"Create [component] at [path] with [feature] like [reference]"

Example:
"Create upload page at /app/upload with drag-drop like QRCode upload"
```

---

## ⚡ Fast Commands

| Want to... | Say this... |
|------------|-------------|
| **Build feature** | "Implement [X] with [requirements]" |
| **Fix bug** | "Fix [issue] - Error: [msg]" |
| **Improve UX** | "Improve [component] to [state]" |
| **Optimize** | "Optimize [feature] for performance" |
| **Add tests** | "Add tests for [feature]" |
| **Document** | "Document [feature] with examples" |
| **Refactor** | "Refactor [code] to use [pattern]" |
| **Explain** | "Explain how [X] works" |

---

## 🎨 Component Requests

### Page with Layout
```
"Create page at [route] with:
- Page title '[Title]'
- Layout: [Card/Grid/Stack]
- Components: [Button/TextField/etc]
- Load data from [source]
- Follow [reference] pattern"
```

### Form Component
```
"Create form with:
- Fields: [list fields]
- Validation: [rules]
- Submit to [endpoint]
- Show [success/error] messages
- Like [reference] form"
```

### List/Gallery
```
"Create [list/gallery] showing [items]:
- Layout: [Grid 5x2 / Table / Cards]
- Display: [field1, field2, field3]
- Actions: [Edit/Delete/View]
- Filter by: [category]
- Like [reference]"
```

---

## 🐛 Debugging Helpers

### Console Error
```
"Getting error: [paste full error]
When: [what you did]
File: [filename]
Help debug!"
```

### Visual Bug
```
"[Component] looks wrong:
Expected: [description or screenshot]
Actual: [description or screenshot]
Fix styling!"
```

### Logic Bug
```
"[Feature] not working correctly:
Should: [expected behavior]
Does: [actual behavior]
When: [conditions]
Fix logic!"
```

---

## 📏 Sizing Requests

### Perfect Size (30-90 min)
```
✅ "Create cursor gallery with selection"
✅ "Add file upload with validation"  
✅ "Build settings page with toggles"
```

### Too Small (<15 min)
```
❌ "Add a button"
❌ "Change text color"

→ Batch these together!
```

### Too Large (>2 hours)
```
❌ "Build entire admin interface"
❌ "Complete all features"

→ Break into smaller pieces!
```

---

## 🎯 Acceptance Criteria Examples

### Functional
```
- [ ] User can [action]
- [ ] Data saves to database
- [ ] Success message appears
- [ ] Errors are handled
- [ ] Works with [scenario]
```

### UI/UX
```
- [ ] Responsive on mobile
- [ ] Loading states shown
- [ ] Error messages clear
- [ ] Uses Polaris components
- [ ] Follows design system
```

### Performance
```
- [ ] Loads in <2 seconds
- [ ] No console errors
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Works with 100+ items
```

---

## 🔄 Iteration Cycle

```
1. YOU: "Build [feature] with [requirements]"
   ↓
2. ME: [Generates complete code]
   ↓
3. YOU: [Test in browser]
   ↓
4. Outcome A: ✅ "Works! Next: [feature]"
   Outcome B: ⚠️ "Works but needs [tweak]"
   Outcome C: ❌ "Error: [details]"
   ↓
5. ME: [Fix/adjust if needed]
   ↓
6. YOU: ✅ "Perfect! Moving on..."
```

**Average cycle:** 20-40 minutes per feature

---

## 🚦 Priority Levels

| Level | When | Examples |
|-------|------|----------|
| **P0** | Blocks everything | Database, auth, core features |
| **P1** | High value | Gallery, upload, main features |
| **P2** | Nice to have | Polish, animations, extras |
| **P3** | Future | Post-MVP features |

**Focus:** Complete all P0, then P1, then P2

---

## 📊 Daily Pattern

### Morning (2-3 hours)
```
1. Review progress (5 min)
2. Pick top 2-3 features (5 min)
3. Build Sprint 1 (60-90 min)
4. Build Sprint 2 (60-90 min)
```

### Afternoon (2-3 hours)
```
5. Build Sprint 3 (60-90 min)
6. Fix bugs found (30-60 min)
7. Test integration (20 min)
8. Plan tomorrow (10 min)
```

### Evening (Optional)
```
9. Manual testing in dev store
10. Note issues for tomorrow
```

---

## ✅ Testing Checklist

After each feature:

**Functional**
- [ ] Happy path works
- [ ] Edge cases handled
- [ ] Errors handled gracefully
- [ ] Data persists correctly

**UI/UX**
- [ ] Looks good on desktop
- [ ] Works on mobile
- [ ] Loading states work
- [ ] No layout issues

**Integration**
- [ ] Works with other features
- [ ] No breaking changes
- [ ] Database updates correctly

---

## 🚨 Troubleshooting

### "It's not working"
**Don't say:** "It doesn't work"
**Do say:** "When I [action], I get [error], expected [result]"

### "I want it different"
**Don't say:** "Make it better"
**Do say:** "Change [specific thing] from [current] to [desired]"

### "I'm confused"
**Don't say:** "I don't understand"
**Do say:** "Explain how [specific concept] works in [file]"

---

## 💡 Pro Tips

### Use References
```
🐌 Slow: Explain entire feature from scratch
⚡ Fast: "Like QRCode upload but for cursors"
```

### Batch Similar Tasks
```
🐌 Slow: Request 5 models one by one
⚡ Fast: "Create all 5 models at once"
```

### Accept "Good Enough"
```
MVP = ✅ Works reliably + handles main cases
MVP ≠ Perfect + every edge case + optimized
```

### Test While I Build
```
⚡ Fast: Test feature A while I build B
🐌 Slow: Wait for all features before testing
```

---

## 📝 Good vs Bad Requests

### ❌ TOO VAGUE
```
"Build the cursor thing"
"Make it work"
"Fix the page"
```

### ⚠️ BETTER
```
"Build cursor gallery"
"Make upload work"
"Fix dashboard layout"
```

### ✅ PERFECT
```
"Build cursor gallery at /app/gallery with grid layout 
showing cursor image, name, category. Load from database. 
Use IndexTable from Polaris. Click selects cursor."
```

---

## 🎯 Daily Goals

### Minimum Viable Day
- 3 features built ✅
- All features tested ✅
- Major bugs fixed ✅
- Progress documented ✅

### Great Day
- 5+ features built ✅
- Integration tested ✅
- Documentation updated ✅
- Tomorrow planned ✅

### Amazing Day
- 7+ features built ✅
- Zero known bugs ✅
- Performance optimized ✅
- Ahead of schedule ✅

---

## ⚡ Speed Hacks

### 1. Prepare Questions
Keep list of decisions needed. Ask in batch.

### 2. Use TODO Comments
While testing:
```javascript
// TODO: Add loading state
// TODO: Handle error case
// TODO: Make responsive
```
Then: "Implement all TODOs in [file]"

### 3. Parallel Work
While I build feature B, you test feature A.

### 4. Standard Patterns
"Use same pattern as [existing feature]" = 3x faster

### 5. Batch Reviews
Review 3 features at once, not one by one.

---

## 📞 When Stuck

### Technical Issue
```
"Stuck on [issue]
Tried: [what you did]
Error: [message]
Need: [what you want to achieve]
Help!"
```

### Need Clarification
```
"To build [feature], I need to know:
1. [Question 1]
2. [Question 2]
Quick answers?"
```

### Not Sure What Next
```
"Completed [features A, B, C]
What's next priority?
Options: [D, E, F]
Your call?"
```

---

## 🎓 Learning Mode

### Understand Code
```
"Explain [file/function/concept] step by step"
"Why did you use [pattern] here?"
"What's the alternative to [approach]?"
```

### Best Practices
```
"What's the best way to [task]?"
"Show me better pattern for [code]"
"How to optimize [feature]?"
```

### Troubleshooting
```
"Why is [issue] happening?"
"How do I debug [problem]?"
"What causes [error]?"
```

---

## 🏆 Success Metrics

### Daily
- ✅ 3-5 features completed
- ✅ <2 hours per feature average
- ✅ All features tested
- ✅ No blocking bugs

### Weekly  
- ✅ 15-20 features completed
- ✅ 10-15% MVP progress
- ✅ Quality maintained
- ✅ On schedule

---

## 🎯 This Week's Focus

Copy and update daily:

```
Week: [1]
Days Remaining: [5]
Target: [Foundation complete]

Today's Must-Do:
1. [Feature A] - P0
2. [Feature B] - P0
3. [Feature C] - P1

Today's Nice-to-Do:
4. [Feature D] - P1
5. [Feature E] - P2

Blockers: [None / List]
```

---

## 📋 Copy-Paste Templates

### Start Feature
```
Feature: [Name]
Requirements: [List]
Acceptance: [Criteria]
Reference: [File]
Build!
```

### Report Bug
```
Bug: [Title]
Expected: [X]
Actual: [Y]
Steps: [1,2,3]
Fix!
```

### Daily Update
```
Today: [Date]
Done: [List]
Testing: [List]
Next: [List]
```

---

## 🚀 Quick Start Right Now

**Copy this → Send to me:**

```
Let's start Day 1: Database Setup

Create Prisma schema with:
1. Cursor model (name, category, imageUrl, etc.)
2. CursorSettings model (shop, activeCursorId, isEnabled)
3. Add indexes
4. Create migration
5. Add seed data (30 cursors)

Following QRCode pattern from existing schema.

Ready? Let's build! 🚀
```

---

## 🎯 Remember

- **Speed comes from clarity** - 5 min planning saves 30 min rework
- **Test immediately** - Find bugs early
- **One thing at a time** - Finish what you start
- **Communicate clearly** - I can't read your mind (yet!)
- **Trust the process** - This works!

---

**Keep this open while developing!**  
**Bookmark it. Reference it. Use it!**

**Now let's build something awesome! 🚀**

---

**Quick Links:**
- Full Strategy: `collaboration-strategy.md`
- Week 1 Plan: `quick-start-checklist.md`
- Requirements: `requirement-analysis/product-requirement.md`

