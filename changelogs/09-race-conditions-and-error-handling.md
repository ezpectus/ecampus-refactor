# Changelog 09 — Race Conditions & Missing Error Handling

**Date:** 18.07.2026
**Scope:** 6 component files
**Audit References:** New findings (race conditions, unhandled promise rejections)

---

## 1. Curator search: stale response race condition (RC-01)

**File:** `src/app/[locale]/(public)/(support)/curator-search/curator-search.tsx`

**Problem:** Fast typing triggered multiple `searchByGroupName` calls in parallel. A slower earlier request could resolve after a newer one, overwriting fresh results with stale data.

**Before:**
```ts
const searchGroups = useCallback(async (name: string) => {
  try {
    setIsLoading(true);
    const response = name ? await searchByGroupName(name) : [];
    setGroups(response);
  } catch (error) {
    errorToast();
  } finally {
    setIsLoading(false);
  }
}, []);
```

**After:**
```ts
const requestIdRef = useRef(0);

const searchGroups = useCallback(async (name: string) => {
  const currentRequestId = ++requestIdRef.current;
  try {
    setIsLoading(true);
    const response = name ? await searchByGroupName(name) : [];
    if (currentRequestId !== requestIdRef.current) return;
    setGroups(response);
  } catch (error) {
    if (currentRequestId !== requestIdRef.current) return;
    errorToast();
  } finally {
    if (currentRequestId === requestIdRef.current) {
      setIsLoading(false);
    }
  }
}, []);
```

**Impact:** Only the most recent search request updates state. Stale responses are silently discarded. Loading state correctly reflects the latest request.

---

## 2. Individual message form: stale student options race (RC-02)

**File:** `src/app/[locale]/(private)/module/msg/components/individual.tsx:77-86`

**Problem:** When user rapidly changed selected groups, `getStudentOptions()` promises resolved out of order. A stale response could populate the recipient dropdown with students from a previous group selection.

**Before:**
```ts
useEffect(() => {
  if (recipientType === 'student' && selectedGroups.length > 0) {
    const groupIds = selectedGroups.map((g) => Number(g.value));
    getStudentOptions(groupIds).then((students) => {
      setUserOptions(students);
    });
  } else if (recipientType === 'student') {
    setUserOptions([]);
  }
}, [selectedGroups, recipientType]);
```

**After:**
```ts
useEffect(() => {
  if (recipientType === 'student' && selectedGroups.length > 0) {
    let isCancelled = false;
    const groupIds = selectedGroups.map((g) => Number(g.value));
    getStudentOptions(groupIds).then((students) => {
      if (!isCancelled) {
        setUserOptions(students);
      }
    });
    return () => {
      isCancelled = true;
    };
  } else if (recipientType === 'student') {
    setUserOptions([]);
  }
}, [selectedGroups, recipientType]);
```

**Impact:** Cleanup function cancels stale promises when groups change rapidly. Only the latest group selection's students are shown.

---

## 3. Multi-select: async search race + loading state leak (RC-03)

**File:** `src/components/ui/multi-select.tsx:318-342`

**Problem:** The async search `useEffect` had no cleanup. When `debouncedSearchTerm` changed rapidly, multiple `onSearch` calls ran in parallel. The first to resolve would set options, then get overwritten by a stale one. Additionally, if `onSearch` threw, `setIsLoading(false)` was never called — the spinner would spin forever.

**Before:**
```ts
const doSearch = async () => {
  setIsLoading(true);
  const res = await onSearch?.(debouncedSearchTerm);
  setOptions(transToGroupOption(res || [], groupBy));
  setIsLoading(false);
};
```

**After:**
```ts
let isCancelled = false;

const doSearch = async () => {
  setIsLoading(true);
  try {
    const res = await onSearch?.(debouncedSearchTerm);
    if (!isCancelled) {
      setOptions(transToGroupOption(res || [], groupBy));
    }
  } finally {
    if (!isCancelled) {
      setIsLoading(false);
    }
  }
};
// ...
return () => { isCancelled = true; };
```

**Impact:** Stale search responses are discarded. Loading state is always cleared via `try/finally`, even if `onSearch` throws.

---

## 4. Intellect publication info: unhandled save error (RC-04)

**File:** `src/app/[locale]/(private)/profile/components/intellect-publication-info.tsx:29-34`

**Problem:** `handleSave` had no try/catch. If `updateIntellectInfo` threw, `setLoading(false)` was never called — the save button spinner would spin forever. The user had no feedback that the save failed.

**Before:**
```ts
const handleSave = async () => {
  setLoading(true);
  await updateIntellectInfo(credo, scientificInterests);
  setLoading(false);
  setIsEditing(false);
};
```

**After:**
```ts
const handleSave = async () => {
  try {
    setLoading(true);
    await updateIntellectInfo(credo, scientificInterests);
    setIsEditing(false);
  } catch {
    errorToast();
  } finally {
    setLoading(false);
  }
};
```

**Impact:** Errors show the standard server error toast. Loading state always resets via `finally`. Edit mode only exits on success.

---

## 5. Certificate verifier: unhandled verification error (RC-05)

**File:** `src/app/[locale]/(public)/validate-certificate/certificate-verifier.tsx:43-51`

**Problem:** `handleFormSubmit` had no try/catch. If `verifyCertificate` threw, the form would be stuck in submitting state, and the user would see a perpetual loading spinner with no error feedback.

**Before:**
```ts
const handleFormSubmit = useCallback(
  async (data: FormData) => {
    setResult('');
    const res = await verifyCertificate(data.certificateId);
    form.reset();
    setResult(res);
  },
  [form],
);
```

**After:**
```ts
const handleFormSubmit = useCallback(
  async (data: FormData) => {
    setResult('');
    try {
      const res = await verifyCertificate(data.certificateId);
      form.reset();
      setResult(res);
    } catch {
      form.reset();
      setResult('error');
    }
  },
  [form],
);
```

**Impact:** On error, the form resets and the error state UI is shown (the "not found" card with support link). No more perpetual spinner.

---

## 6. Study sheet detail: missing `id` dependency + no cleanup (RC-06)

**File:** `src/app/[locale]/(private)/module/studysheet/[id]/page.tsx:35-48`

**Problem:** The `useEffect` had `[]` deps but used `id` from `useParams()`. If the route param changed (client-side navigation between study sheets), the data would not refetch. Additionally, no cleanup meant a slow response from a previous `id` could overwrite the new one.

**Before:**
```ts
useEffect(() => {
  async function fetchData() {
    try {
      const data = await getMonitoringById(id as string);
      setCreditModule(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load study sheet:', error);
      setIsLoading(false);
    }
  }
  fetchData();
}, []);
```

**After:**
```ts
useEffect(() => {
  let isCancelled = false;

  async function fetchData() {
    try {
      const data = await getMonitoringById(id as string);
      if (!isCancelled) {
        setCreditModule(data);
        setIsLoading(false);
      }
    } catch (error) {
      if (!isCancelled) {
        console.error('Failed to load study sheet:', error);
        setIsLoading(false);
      }
    }
  }

  fetchData();
  return () => {
    isCancelled = true;
  };
}, [id]);
```

**Impact:** Data refetches when `id` changes. Stale responses from a previous `id` are discarded via cleanup. Loading state only updates for the current request.
