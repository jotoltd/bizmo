# App Store Screenshots Preparation Guide

## Required Screenshots (iOS)

Apple requires screenshots for these device sizes:

1. **iPhone 6.7" Display** (iPhone 15 Pro Max, 14 Pro Max) - 1290 x 2796px
2. **iPhone 6.5" Display** (iPhone 14 Plus, 13 Pro Max) - 1284 x 2778px  
3. **iPhone 5.5" Display** (iPhone 8 Plus, SE) - 1242 x 2208px
4. **iPad 12.9" Display** (iPad Pro) - 2048 x 2732px (optional but recommended)

## Screenshot Content Strategy

### Screenshot 1: Dashboard/Home
- **Focus:** Hero card showing business stats
- **Text:** "Your Readiness HQ" or "Track Business Progress"
- **Show:** Business list, progress bars, completion percentage

### Screenshot 2: Business Detail
- **Focus:** Active business view
- **Text:** "Complete Setup Steps" or "Stay Compliant"
- **Show:** Tasks/checklist, team section, activity log

### Screenshot 3: Team Collaboration
- **Focus:** Team invitations and members
- **Text:** "Work Together" or "Invite Your Team"
- **Show:** Invite flow, pending invitations, team members list

### Screenshot 4: Progress Tracking
- **Focus:** Completion status and progress bars
- **Text:** "Never Miss a Deadline" or "Stay On Track"
- **Show:** Progress visualization, completed tasks, statistics

### Screenshot 5: Mobile-First Design
- **Focus:** Dark theme, modern UI
- **Text:** "Beautiful & Intuitive" or "Built for Business"
- **Show:** Clean interface, electric accent color, glass card effects

## Preparation Steps

### 1. Prepare Test Data

Create a demo account with:
- 2-3 sample businesses (different types)
- Mix of completed and pending tasks
- At least 1 team member invited
- Some activity history

### 2. Screenshot Timing

Best times to capture:
- **Morning light** for natural look
- **Clean state** - no error messages or loading states
- **Populated data** - not empty states

### 3. Device Preparation

For each device size:
```bash
# In Xcode Simulator
# 1. Launch simulator for target device
# 2. Reset content if needed: Device > Erase All Content and Settings
# 3. Sign in with demo account
# 4. Navigate to screen
# 5. Screenshot: Cmd + S (saves to desktop)
```

### 4. Screenshot Tools

**Option A: Simulator (Recommended)**
- Xcode → Device → Screenshot
- Automatic correct dimensions

**Option B: Physical Device**
- Press Side + Volume Up
- Transfer via AirDrop

**Option C: Screenshot Tools**
- Screenshot Pro (App Store)
- SimGen (macOS app)

## Design Specifications

### Frame/Template Options:

1. **No Frame** (Apple style)
   - Clean screenshot only
   - Apple adds device frame automatically

2. **Text Overlay** (Marketing style)
   - Top 25%: Headline text
   - Bottom 75%: Screenshot
   - Use San Francisco font
   - Keep text under 5 words

### Color Palette for Text Overlays:
- Background: `#0f172a` (dark-2)
- Text: `#f8fafc` (white)
- Accent: `#4de2ff` (electric)

## App Store Connect Requirements

### Upload Process:
1. Archive app in Xcode
2. Upload to App Store Connect
3. Go to App Store Connect → Your App → App Information
4. Navigate to "iOS App" → "Prepare for Submission"
5. Upload screenshots for each size
6. Apple automatically scales to other devices

### Screenshot Order:
- Most compelling first (usually Dashboard)
- Logical flow: Dashboard → Detail → Team → Progress
- Save best for first 3 (visible in search)

## Recommended Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Xcode Simulator | Capture screenshots | Free |
| SimGen | Bulk screenshot generation | $19 |
| Screenshot Pro | Annotated screenshots | Free |
| Figma | Create text overlays | Free |
| Canva | Marketing templates | Free tier |

## Quick Checklist

- [ ] Demo account with realistic data created
- [ ] iPhone 6.7" screenshots (5 required)
- [ ] iPhone 6.5" screenshots (5 required)
- [ ] iPhone 5.5" screenshots (5 required)
- [ ] Screenshots reviewed for quality
- [ ] No placeholder/test data visible
- [ ] Text overlays added (optional)
- [ ] Screenshots uploaded to App Store Connect

## Text Copy for Overlays

**Option 1 - Professional:**
1. "Track Your Business Setup"
2. "Complete Compliance Tasks"
3. "Collaborate With Your Team"
4. "Stay Deadline Ready"
5. "Launch With Confidence"

**Option 2 - Benefit-focused:**
1. "Get Business Ready Fast"
2. "Never Miss a Deadline"
3. "Work Together Seamlessly"
4. "Track Progress Visually"
5. "Your Business Command Center"

## Resources

- [Apple Screenshot Specifications](https://help.apple.com/app-store-connect/#/devd274dd925)
- [App Store Screenshot Guidelines](https://developer.apple.com/app-store/screenshots/)
- [SimGen Tool](https://simgen.io/)
