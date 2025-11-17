# 🎵 Audio Usage Audit & Optimization Report

## Current Status ✅

Good news! Your **course system is already optimized** and NOT wasting credits on fixed content.

---

## ✅ What's Already Optimized (Pre-generated Audio)

### Courses & Lessons - **ZERO Runtime TTS Cost**

All 48 listening questions use **pre-generated audio** from Supabase Storage:

**Files**: `src/components/questions/ListeningQuestion.jsx`
```javascript
{question.question_audio_url && (
  <AudioPlayer audioUrl={question.question_audio_url} />
)}
```

**How it works**:
1. Audio generated ONCE via `npm run generateAudio`
2. Uploaded to Supabase Storage
3. URLs saved in `audioUrls.json` (48 files)
4. Database seeded with URLs via `npm run seed-database`
5. Frontend plays from CDN (NO TTS calls)

**Cost**: ✅ **$0 per lesson** (one-time generation cost only)

---

## ⚠️ Where Credits ARE Being Used (Intentionally)

### 1. Translation Feature (Home.jsx)

**Location**: `src/pages/Home.jsx`
**Usage**: Generates audio for user's translated text

**Example**:
- User types: "I love you"
- Translates to: "Мен сени сүйөм"
- Generates audio for "Мен сени сүйөм"

**Why it's necessary**:
- Users can input ANY text
- Infinite possibilities = can't pre-generate
- Audio is unique per translation

**Cost**: ~1 ElevenLabs call per translation

### 2. Vocabulary Cards (Vocabulary.jsx)

**Location**: `src/pages/Vocabulary.jsx`
**Usage**: Generates audio for saved vocabulary words

**Example**:
- User saves word: "апа" (mother)
- Generates audio for the word + example sentence

**Why it's necessary**:
- User-generated vocabulary
- Each user has different saved words
- Can't predict what they'll save

**Cost**: ~2 ElevenLabs calls per vocabulary card

---

## 📊 Credit Usage Breakdown

### Current System:

| Feature | Audio Type | TTS Calls | Cost per Use | Optimization Status |
|---------|-----------|-----------|--------------|-------------------|
| **Listening Questions** | Pre-generated | 0 | $0 | ✅ Fully Optimized |
| **Course Content** | Pre-generated | 0 | $0 | ✅ Fully Optimized |
| **Translation Feature** | Runtime | 1 | ~$0.001 | ⚠️ Necessary for UX |
| **Vocabulary Cards** | Runtime | 2 | ~$0.002 | ⚠️ Necessary for UX |

### Estimated Monthly Costs:

**Courses** (48 lessons × users):
- Cost: **$0** (pre-generated, already paid)
- Savings: **100%**

**Translation Feature** (100 translations/month):
- Cost: **~$0.10/month**
- Necessary: YES (dynamic content)

**Vocabulary Cards** (50 cards/month):
- Cost: **~$0.10/month**
- Necessary: YES (user-generated)

**Total Monthly**: **~$0.20** for dynamic features only

---

## 💡 Optimization Opportunities

### Option 1: Cache Vocabulary Audio ⭐ RECOMMENDED

**Problem**: Same word might be saved by multiple users
**Solution**: Check if audio exists before generating

**Implementation**:
```javascript
// In Vocabulary.jsx
const getOrGenerateAudio = async (text) => {
  // Check if we already generated this
  const existingAudio = await checkAudioCache(text)
  if (existingAudio) return existingAudio

  // Generate only if new
  const { audioBlob } = await generateSpeech(text)
  await saveAudioToCache(text, audioBlob)
  return audioBlob
}
```

**Savings**: 50-80% on vocabulary audio (common words reused)

### Option 2: Pre-generate Common Vocabulary

**Implementation**:
1. Create list of 1000 most common Kyrgyz words
2. Generate audio in batch
3. Store in database with word → URL mapping
4. Use pre-generated when available

**Savings**: 90%+ on common vocabulary

### Option 3: Client-Side Audio Caching

**Current behavior**: User plays same audio → generates TTS each time
**Better approach**: Cache audio blobs in memory/localStorage

**Implementation**:
```javascript
const audioCache = new Map()

const playAudio = async (text) => {
  if (!audioCache.has(text)) {
    const { audioBlob } = await generateSpeech(text)
    audioCache.set(text, URL.createObjectURL(audioBlob))
  }

  const audio = new Audio(audioCache.get(text))
  audio.play()
}
```

**Savings**: Eliminates duplicate generation in same session

---

## ✅ Recommendations

### Immediate Actions (0 cost, high impact):

1. **✅ DONE** - Courses use pre-generated audio
2. **ADD** - Client-side caching for translation audio
3. **ADD** - Vocabulary audio deduplication

### Future Enhancements:

1. **Pre-generate Top 500 Words** - Cover 80% of vocabulary usage
2. **Audio CDN** - Store all user-generated audio, deduplicate by hash
3. **Usage Analytics** - Track which words are generated most often

---

## 🎯 Action Plan

### Phase 1: Add Client-Side Caching (1 hour)

**File**: `src/pages/Home.jsx`
**Change**: Add `Map()` cache for audio blobs

**Expected savings**: 40-60% on repeated translations

### Phase 2: Vocabulary Deduplication (2 hours)

**Files**: `src/pages/Vocabulary.jsx`, `src/services/supabase.js`
**Change**: Check Supabase for existing audio before generating

**Expected savings**: 50-70% on vocabulary audio

### Phase 3: Common Words Database (4 hours)

**New files**: `src/data/commonWords.js`, batch generation script
**Change**: Pre-generate 1000 common words

**Expected savings**: 80-90% on vocabulary audio

---

## 📈 Current vs Optimized Costs

### Current System:
- **Courses**: $0 ✅ (already optimized)
- **Translation**: ~$0.10/month (necessary)
- **Vocabulary**: ~$0.10/month (can optimize)
- **Total**: ~$0.20/month

### After All Optimizations:
- **Courses**: $0 ✅
- **Translation**: ~$0.04/month (caching)
- **Vocabulary**: ~$0.01/month (dedup + common words)
- **Total**: ~$0.05/month

**Potential savings**: 75% on dynamic features

---

## 🎓 Best Practices Already Implemented

✅ **Pre-generation for static content** - All course audio
✅ **CDN delivery** - Supabase Storage with caching
✅ **Lazy loading** - Audio only loaded when needed
✅ **Error handling** - Fallback when audio unavailable

---

## ❌ What NOT to Do

**DON'T**:
- ❌ Remove TTS from translation feature (breaks UX)
- ❌ Remove TTS from vocabulary (breaks user-generated content)
- ❌ Pre-generate audio for all possible sentences (impossible)
- ❌ Block users from generating audio (defeats purpose)

**DO**:
- ✅ Cache what you've already generated
- ✅ Deduplicate common content
- ✅ Monitor usage patterns
- ✅ Pre-generate predictable content

---

## 📝 Summary

**Your course system is already optimal!** 🎉

- Listening questions: ✅ Pre-generated
- Course content: ✅ No runtime TTS
- User features: ⚠️ Necessary runtime TTS, but can be cached

**Next steps**:
1. Add client-side audio caching (biggest impact, easiest)
2. Implement vocabulary deduplication (medium impact)
3. Pre-generate common words (long-term optimization)

**Current credit usage is actually very efficient** - only dynamic, user-generated content uses TTS, which is exactly as it should be.

---

**Generated**: 2025-01-17
**Status**: ✅ Courses optimized, user features can be improved
**Recommendation**: Implement client-side caching first
