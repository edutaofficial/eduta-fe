# Project Structure Reorganization Summary

**Date:** November 8, 2025  
**Purpose:** Consolidate hooks and utilities into centralized directories for better maintainability and adherence to Next.js best practices.

---

## 📁 Directory Structure Changes

### `/lib` Directory

#### **Before:**
```
lib/
├── utils/
│   ├── errorUtils.ts
│   └── videoUtils.ts
├── config/
│   └── api.ts
├── context/
│   └── AuthContext.tsx
├── constants.ts
└── utils.ts
```

#### **After:**
```
lib/
├── config/
│   └── api.ts
├── context/
│   └── AuthContext.tsx
├── constants.ts
├── curriculumUtils.ts     (NEW - moved from Curriculum component)
├── errorUtils.ts          (MOVED from lib/utils/)
├── videoUtils.ts          (MOVED from lib/utils/)
└── utils.ts
```

**Changes:**
- ✅ Removed `lib/utils/` subdirectory
- ✅ Moved `errorUtils.ts` from `lib/utils/` → `lib/`
- ✅ Moved `videoUtils.ts` from `lib/utils/` → `lib/`
- ✅ Added `curriculumUtils.ts` (moved from component-specific location)

---

### `/hooks` Directory

#### **Before:**
```
hooks/
├── use-stepper.ts
├── useApi.ts
└── useUpload.ts
```

#### **After:**
```
hooks/
├── use-stepper.ts
├── useApi.ts
├── useCurriculumForm.ts    (NEW - moved from Curriculum component)
└── useUpload.ts
```

**Changes:**
- ✅ Added `useCurriculumForm.ts` (moved from `components/Instructor/CourseCreation/Curriculum/`)

---

## 🔄 Import Path Updates

All imports have been automatically updated across the codebase:

### Updated Files (20 total):

#### **Utility Imports** (`errorUtils.ts` & `videoUtils.ts`)
1. `components/Instructor/CourseCreation/Curriculum/LectureItem.tsx`
2. `store/useLearnerStore.ts`
3. `store/useCourseStore.ts`
4. `store/useInstructorStore.ts`
5. `app/api/learner/getEnrolledCourses.ts`
6. `app/api/learner/getCertificates.ts`
7. `app/api/learner/wishlist.ts`
8. `app/api/auth/signup.ts`
9. `app/api/auth/login.ts`
10. `app/api/course/getCourseForEdit.ts`
11. `app/api/course/getCourseById.ts`
12. `app/api/course/deleteCourse.ts`
13. `app/api/course/getInstructorCourses.ts`
14. `app/api/course/updateCourseDetails.ts`
15. `app/api/course/updatePricing.ts`
16. `app/api/course/updateCurriculum.ts`
17. `app/api/course/saveDraft.ts`
18. `app/api/course/publishCourse.ts`
19. `app/api/course/createCourse.ts`
20. `app/api/course/getCategories.ts`

**Import change:**
```typescript
// Before
import { extractErrorMessage } from "@/lib/utils/errorUtils";
import { getVideoDuration, secondsToMinutes } from "@/lib/utils/videoUtils";

// After
import { extractErrorMessage } from "@/lib/errorUtils";
import { getVideoDuration, secondsToMinutes } from "@/lib/videoUtils";
```

#### **Hook & Curriculum Utils Imports**
1. `components/Instructor/CourseCreation/Curriculum/index.tsx`
2. `hooks/useCurriculumForm.ts`

**Import changes:**
```typescript
// Before (in Curriculum/index.tsx)
import { useCurriculumForm } from "./useCurriculumForm";

// After
import { useCurriculumForm } from "@/hooks/useCurriculumForm";

// Before (in useCurriculumForm.ts)
import { transformStoreToFormData, ... } from "./utils";

// After
import { transformStoreToFormData, ... } from "@/lib/curriculumUtils";
```

---

## 🧹 Deleted Files

The following files were successfully removed after migration:

1. ❌ `lib/utils/errorUtils.ts` (moved to `lib/errorUtils.ts`)
2. ❌ `lib/utils/videoUtils.ts` (moved to `lib/videoUtils.ts`)
3. ❌ `lib/utils/` (empty directory removed)
4. ❌ `components/Instructor/CourseCreation/Curriculum/useCurriculumForm.ts` (moved to `hooks/useCurriculumForm.ts`)
5. ❌ `components/Instructor/CourseCreation/Curriculum/utils.ts` (moved to `lib/curriculumUtils.ts`)

---

## ✅ Verification

### Linting
- **Status:** ✅ All files pass ESLint
- **Command:** `npm run lint`
- **Result:** No errors or warnings

### Type Checking
- **Status:** ✅ TypeScript compilation successful
- **All imports resolved correctly**

---

## 📚 Utility Descriptions

### `/lib/errorUtils.ts`
- `extractErrorMessage()` - Extracts user-friendly error messages from Axios errors
- `isNetworkError()` - Checks if an error is a network error
- `getNetworkErrorMessage()` - Returns a user-friendly network error message

### `/lib/videoUtils.ts`
- `getVideoDuration()` - Extracts video duration in seconds from a File object
- `formatDuration()` - Formats duration in seconds to readable string (e.g., "1h 30m")
- `secondsToMinutes()` - Converts seconds to minutes (rounded up)

### `/lib/curriculumUtils.ts`
- `transformStoreToFormData()` - Transforms Zustand store curriculum to Formik form structure
- `createDefaultSection()` - Creates a default section with one lecture
- `createDefaultLecture()` - Creates a default lecture with empty fields
- `isSectionValid()` - Validates if a section is complete
- `isLectureValid()` - Validates if a lecture is complete
- `findFirstInvalidField()` - Finds the first invalid field for error focus
- `scrollToElement()` - Smoothly scrolls to an element by ID

### `/hooks/useCurriculumForm.ts`
Custom hook for managing curriculum form state:
- Formik integration
- Zustand store synchronization
- Section/lecture CRUD operations
- Atomic batch updates (prevents race conditions)
- Upload state tracking
- Comprehensive validation with error focus

---

## 🎯 Benefits of This Reorganization

1. **✅ Cleaner Structure**
   - Flat utility structure in `/lib` (no nested subdirectories)
   - All hooks centralized in `/hooks`

2. **✅ Better Discoverability**
   - Easier to find utilities and hooks
   - Consistent import paths across the codebase

3. **✅ Maintainability**
   - Centralized utilities are easier to update
   - No duplicate utility functions

4. **✅ Industry Standards**
   - Follows Next.js 14+ best practices
   - Aligns with enterprise-level project structures

5. **✅ Type Safety**
   - All imports properly typed
   - No breaking changes to existing functionality

---

## 🔗 Related Documentation

- [Authentication Architecture](./docs/AUTHENTICATION_ARCHITECTURE.md)
- [Curriculum Component Architecture](./components/Instructor/CourseCreation/Curriculum/README.md)

---

## ⚠️ Migration Notes for Developers

If you're working on a feature branch, you may need to update your imports:

### Search and Replace Pattern:
```bash
# For errorUtils
Find:    from "@/lib/utils/errorUtils"
Replace: from "@/lib/errorUtils"

# For videoUtils
Find:    from "@/lib/utils/videoUtils"
Replace: from "@/lib/videoUtils"
```

### New Import Locations:
- Curriculum utilities: `@/lib/curriculumUtils`
- Curriculum form hook: `@/hooks/useCurriculumForm`

---

**Last Updated:** November 8, 2025  
**Status:** ✅ Complete

