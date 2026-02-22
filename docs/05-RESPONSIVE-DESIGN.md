# 05 — Responsive Design Guide

> Enterprise HR Management System — Mobile-First Responsive Strategy
> Last updated: 2026-02-22

---

## 1. Breakpoint System

| Breakpoint  | Width          | Device                   | Tailwind Prefix |
| ----------- | -------------- | ------------------------ | --------------- |
| **Mobile**  | 375px – 767px  | iPhone, Android phones   | (default)       |
| **Tablet**  | 768px – 1439px | iPad, Android tablets    | `md:`           |
| **Desktop** | 1440px+        | Laptop, Desktop monitors | `lg:` / `xl:`   |

---

## 2. Layout Strategy per Breakpoint

### 2.1 Mobile (375px) — Bottom Navigation

```
┌─────────────────────────┐
│  Header (Logo + Avatar) │
├─────────────────────────┤
│                         │
│     Content Area        │
│     (Full width)        │
│     1-column layout     │
│                         │
│  ┌───────────────────┐  │
│  │  <UCard> List     │  │
│  │  (No tables!)     │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│ 🏠  👥  📅  💼  ⚙️    │
│    Bottom Navigation    │
└─────────────────────────┘
```

**Rules:**

- **Navigation:** Bottom tab bar (5 main items)
- **Tables:** ห้ามใช้ `<UTable>` — ใช้ `<UCard>` แสดงเป็น list แทน
- **Forms:** 1 คอลัมน์ (`grid-cols-1`)
- **Dashboard:** Metrics cards เรียงแนวตั้ง (1 column)
- **Sidebar:** ซ่อนทั้งหมด — ใช้ bottom nav แทน
- **Search:** Full-width search bar ด้านบน
- **Modals:** Full-screen (bottom sheet style)

### 2.2 Tablet (768px) — Mini Sidebar

```
┌──────┬──────────────────────────┐
│      │  Header (Search + Icons) │
│  🏠  ├──────────────────────────┤
│  👥  │                          │
│  📅  │    Content Area          │
│  💼  │    2-column forms        │
│  📈  │    Simplified <UTable>   │
│  ⚙️  │                          │
│      │                          │
│ 72px │                          │
└──────┴──────────────────────────┘
```

**Rules:**

- **Sidebar:** Mini sidebar (72px) — แสดงเฉพาะไอคอน, tooltip แสดงชื่อเมนู
- **Tables:** `<UTable>` แบบลดรูป (ซ่อนคอลัมน์ที่ไม่จำเป็น)
- **Forms:** 2 คอลัมน์ (`grid-cols-2`)
- **Dashboard:** Metrics cards 2 คอลัมน์
- **Modals:** Center modal (ไม่ full-screen)

### 2.3 Desktop (1440px+) — Full Sidebar

```
┌────────────┬─────────────────────────────────────┐
│            │  Header (Search + Lang + Theme + 👤) │
│  🏠 Home   ├─────────────────────────────────────┤
│  👥 Staff  │                                     │
│  📅 Leave  │    Content Area                     │
│  💼 Assets │    Complex <UTable> with filters    │
│  📈 Review │    3-4 column dashboard             │
│  🧾 Claims │                                     │
│  📊 Report │                                     │
│  ⚙️ Config │                                     │
│            │                                     │
│   240px    │                                     │
└────────────┴─────────────────────────────────────┘
```

**Rules:**

- **Sidebar:** Full sidebar (240px) — ไอคอน + ชื่อเมนู + submenu
- **Tables:** `<UTable>` แบบเต็มรูปแบบ พร้อมระบบ filter, sort, column visibility
- **Forms:** 3-4 คอลัมน์ สำหรับฟอร์มที่ซับซ้อน
- **Dashboard:** 3-4 คอลัมน์ grid
- **Modals:** Center modal ขนาดพอดี

---

## 3. Component Responsive Patterns

### 3.1 Data Display — Table vs Card

```vue
<!-- Desktop/Tablet: Show Table -->
<UTable
  v-if="!isMobile"
  :rows="employees"
  :columns="columns"
/>

<!-- Mobile: Show Card List -->
<div v-else class="space-y-3">
  <UCard
    v-for="emp in employees"
    :key="emp.id"
    class="cursor-pointer"
    @click="navigateTo(`/employees/${emp.id}`)"
  >
    <div class="flex items-center gap-3">
      <UAvatar :alt="emp.firstName" size="md" />
      <div class="flex-1 min-w-0">
        <p class="text-headline truncate">
          {{ emp.firstName }} {{ emp.lastName }}
        </p>
        <p class="text-caption text-gray-500">
          {{ emp.department.departmentName }}
        </p>
      </div>
      <UBadge
        :color="emp.isActive ? 'green' : 'red'"
        variant="subtle"
      >
        {{ emp.isActive ? 'Active' : 'Inactive' }}
      </UBadge>
    </div>
  </UCard>
</div>
```

### 3.2 Form Layout

```vue
<!-- Responsive form grid -->
<UForm :state="form" class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <UFormGroup label="First Name">
      <UInput v-model="form.firstName" />
    </UFormGroup>
    <UFormGroup label="Last Name">
      <UInput v-model="form.lastName" />
    </UFormGroup>
    <UFormGroup label="ID Card">
      <UInput v-model="form.idCard" />
    </UFormGroup>
    <UFormGroup label="Department">
      <USelect v-model="form.departmentId" :options="departments" />
    </UFormGroup>
    <UFormGroup label="Job Title">
      <USelect v-model="form.jobTitleId" :options="jobTitles" />
    </UFormGroup>
    <UFormGroup label="Base Salary">
      <UInput v-model="form.baseSalary" type="number" />
    </UFormGroup>
  </div>
</UForm>
```

### 3.3 Dashboard Grid

```vue
<!-- Metrics Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <UCard v-for="metric in metrics" :key="metric.label">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-xl bg-primary-50">
        <UIcon :name="metric.icon" class="text-primary-500 w-6 h-6" />
      </div>
      <div>
        <p class="text-caption text-gray-500">{{ metric.label }}</p>
        <p class="text-title-2">{{ metric.value }}</p>
      </div>
    </div>
  </UCard>
</div>

<!-- Charts -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
  <UCard>
    <template #header>
      <h3 class="text-headline">Department Headcount</h3>
    </template>
    <!-- Bar Chart -->
  </UCard>
  <UCard>
    <template #header>
      <h3 class="text-headline">Leave Requests This Month</h3>
    </template>
    <!-- Line Chart -->
  </UCard>
</div>
```

### 3.4 Sidebar Navigation

```vue
<template>
  <!-- Desktop: Full sidebar -->
  <aside
    class="hidden lg:flex flex-col w-60 border-r border-gray-200
           dark:border-gray-800 bg-white dark:bg-gray-900"
  >
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-xl
               text-body hover:bg-gray-100 dark:hover:bg-gray-800
               transition-colors duration-150"
      >
        <UIcon :name="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>

  <!-- Tablet: Mini sidebar (icon only) -->
  <aside
    class="hidden md:flex lg:hidden flex-col w-[72px] items-center
           border-r border-gray-200 dark:border-gray-800
           bg-white dark:bg-gray-900"
  >
    <nav class="flex-1 py-4 space-y-2">
      <UTooltip
        v-for="item in navItems"
        :key="item.to"
        :text="item.label"
        :popper="{ placement: 'right' }"
      >
        <NuxtLink
          :to="item.to"
          class="flex items-center justify-center w-12 h-12
                 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                 transition-colors duration-150"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
        </NuxtLink>
      </UTooltip>
    </nav>
  </aside>

  <!-- Mobile: Bottom navigation -->
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-50
           bg-white dark:bg-gray-900 border-t border-gray-200
           dark:border-gray-800 safe-area-bottom"
  >
    <div class="flex justify-around py-2">
      <NuxtLink
        v-for="item in mobileNavItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 px-3 py-1"
      >
        <UIcon :name="item.icon" class="w-6 h-6" />
        <span class="text-[10px]">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
```

---

## 4. Table Column Visibility

กำหนดคอลัมน์ที่แสดงตาม breakpoint:

### Employees Table

| Column        | Mobile (Card) | Tablet | Desktop       |
| ------------- | ------------- | ------ | ------------- |
| Avatar + Name | ✅            | ✅     | ✅            |
| ID Card       | ❌            | ❌     | ✅            |
| Department    | ✅ (subtitle) | ✅     | ✅            |
| Job Title     | ❌            | ✅     | ✅            |
| Hire Date     | ❌            | ❌     | ✅            |
| Base Salary   | ❌            | ❌     | ✅ (Admin/HR) |
| Status        | ✅ (badge)    | ✅     | ✅            |
| Actions       | ❌ (tap card) | ✅     | ✅            |

### Leave Requests Table

| Column        | Mobile (Card) | Tablet | Desktop |
| ------------- | ------------- | ------ | ------- |
| Employee Name | ✅            | ✅     | ✅      |
| Leave Type    | ✅            | ✅     | ✅      |
| Date Range    | ✅ (compact)  | ✅     | ✅      |
| Status        | ✅ (badge)    | ✅     | ✅      |
| Approver      | ❌            | ❌     | ✅      |
| Actions       | ❌ (tap card) | ✅     | ✅      |

### Assets Table

| Column        | Mobile (Card) | Tablet | Desktop |
| ------------- | ------------- | ------ | ------- |
| Asset Name    | ✅            | ✅     | ✅      |
| Serial Number | ❌            | ✅     | ✅      |
| Assigned To   | ✅ (subtitle) | ✅     | ✅      |
| Status        | ✅ (badge)    | ✅     | ✅      |
| Actions       | ❌ (tap card) | ✅     | ✅      |

---

## 5. Mobile-Specific UX Patterns

### 5.1 Pull-to-Refresh

```vue
<!-- ใช้ native pull-to-refresh สำหรับ list pages -->
<div @touchstart="onTouchStart" @touchend="onTouchEnd">
  <!-- content -->
</div>
```

### 5.2 Swipe Actions (Card List)

```vue
<!-- Swipe left to reveal actions on mobile cards -->
<UCard class="relative overflow-hidden">
  <div class="flex items-center gap-3">
    <!-- Card content -->
  </div>
  <!-- Hidden action buttons revealed on swipe -->
</UCard>
```

### 5.3 Bottom Sheet Modal

```vue
<!-- Mobile: Full-screen bottom sheet -->
<UModal
  :ui="{
    width: 'sm:max-w-lg',
    // On mobile, use bottom sheet style
    container: 'items-end sm:items-center',
    rounded: 'rounded-t-2xl sm:rounded-2xl',
  }"
>
  <!-- Modal content -->
</UModal>
```

### 5.4 Safe Area (Notch / Home Indicator)

```css
/* Support for iPhone notch and home indicator */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
```

---

## 6. Composable: useResponsive

```ts
// composables/useResponsive.ts
export function useResponsive() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);

  const updateBreakpoint = () => {
    const width = window.innerWidth;
    isMobile.value = width < 768;
    isTablet.value = width >= 768 && width < 1440;
    isDesktop.value = width >= 1440;
  };

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateBreakpoint);
  });

  return { isMobile, isTablet, isDesktop };
}
```

**Usage:**

```vue
<script setup>
const { isMobile, isTablet, isDesktop } = useResponsive();
</script>

<template>
  <UTable v-if="!isMobile" :rows="data" :columns="columns" />
  <CardList v-else :items="data" />
</template>
```

---

## 7. Performance Considerations

| Strategy               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **Lazy Loading**       | โหลด component เฉพาะเมื่อ scroll เข้ามาในวิว               |
| **Virtual Scroll**     | ใช้ virtual scroll สำหรับ list ที่มีข้อมูลมากกว่า 100 rows |
| **Image Optimization** | ใช้ `<NuxtImg>` พร้อม responsive sizes                     |
| **Code Splitting**     | แยก chunk ตาม route (Nuxt ทำให้อัตโนมัติ)                  |
| **Prefetch**           | Prefetch หน้าที่ user น่าจะไปต่อ                           |
| **Skeleton Loading**   | แสดง skeleton placeholder ระหว่างโหลดข้อมูล                |

### Skeleton Example

```vue
<template>
  <div v-if="pending" class="space-y-3">
    <USkeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-xl" />
  </div>
  <div v-else>
    <!-- Actual content -->
  </div>
</template>
```
