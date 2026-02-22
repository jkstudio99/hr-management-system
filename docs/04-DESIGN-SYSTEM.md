# 04 — Design System

> Enterprise HR Management System — Apple-like UI/UX + PrimeNG Orange
> Last updated: 2026-02-22

---

## 1. Design Philosophy

ออกแบบ UI/UX ตามแนวทาง **Apple Human Interface Guidelines (HIG)** ผสมผสานกับ **PrimeNG Orange** เป็นสี Primary เน้นความสะอาด เรียบง่าย และใช้งานง่าย

**หลักการออกแบบ:**

- **Clarity** — เนื้อหาอ่านง่าย ลำดับชั้นชัดเจน
- **Deference** — UI ไม่แย่งความสนใจจากเนื้อหา
- **Depth** — ใช้เงาและ layers สร้างมิติ
- **Consistency** — ใช้ component เดียวกันทั้งระบบ

---

## 2. Typography

### Font Family

```css
font-family: "Noto Sans Thai", sans-serif;
```

ติดตั้งผ่าน `@nuxtjs/google-fonts`:

```ts
// nuxt.config.ts
googleFonts: {
  families: {
    'Noto Sans Thai': [300, 400, 500, 600, 700],
  },
  display: 'swap',
}
```

### Typography Scale (9 ระดับ)

| Name            | Size | Weight         | Line Height | Usage                     |
| --------------- | ---- | -------------- | ----------- | ------------------------- |
| **Large Title** | 34px | Bold (700)     | 41px        | หน้าหลัก, Hero section    |
| **Title 1**     | 28px | Bold (700)     | 34px        | หัวข้อหน้า (Page title)   |
| **Title 2**     | 22px | SemiBold (600) | 28px        | หัวข้อ Section            |
| **Title 3**     | 20px | Medium (500)   | 25px        | หัวข้อย่อย                |
| **Headline**    | 17px | SemiBold (600) | 22px        | หัวข้อ Card, Table header |
| **Body**        | 17px | Regular (400)  | 22px        | เนื้อหาหลัก               |
| **Callout**     | 16px | Regular (400)  | 21px        | คำอธิบายเพิ่มเติม         |
| **Subhead**     | 15px | Regular (400)  | 20px        | Label, Subtitle           |
| **Caption**     | 12px | Regular (400)  | 16px        | Timestamp, Helper text    |

### Tailwind CSS Classes

```css
/* app.css หรือ tailwind layer */
.text-large-title {
  @apply text-[34px] font-bold leading-[41px];
}
.text-title-1 {
  @apply text-[28px] font-bold leading-[34px];
}
.text-title-2 {
  @apply text-[22px] font-semibold leading-[28px];
}
.text-title-3 {
  @apply text-[20px] font-medium leading-[25px];
}
.text-headline {
  @apply text-[17px] font-semibold leading-[22px];
}
.text-body {
  @apply text-[17px] font-normal leading-[22px];
}
.text-callout {
  @apply text-[16px] font-normal leading-[21px];
}
.text-subhead {
  @apply text-[15px] font-normal leading-[20px];
}
.text-caption {
  @apply text-[12px] font-normal leading-[16px];
}
```

---

## 3. Color Palette

### 3.1 Primary Colors

| Token           | Hex       | Usage                                   |
| --------------- | --------- | --------------------------------------- |
| `primary`       | `#F97316` | Brand color, CTA buttons, Active states |
| `primary-hover` | `#EA580C` | Hover state                             |
| `primary-dark`  | `#FB923C` | Dark mode primary                       |
| `primary-50`    | `#FFF7ED` | Light background tint                   |
| `primary-100`   | `#FFEDD5` | Selected row, Badge background          |
| `primary-500`   | `#F97316` | Default primary                         |
| `primary-600`   | `#EA580C` | Hover                                   |
| `primary-700`   | `#C2410C` | Active/Pressed                          |

### 3.2 Secondary Colors

| Token             | Hex       | Usage                        |
| ----------------- | --------- | ---------------------------- |
| `secondary`       | `#00C781` | Success, Positive indicators |
| `secondary-hover` | `#00A86B` | Hover state                  |

### 3.3 Semantic Colors

| Token     | Hex       | Usage                |
| --------- | --------- | -------------------- |
| `success` | `#00C781` | สำเร็จ, อนุมัติแล้ว  |
| `warning` | `#FBBF24` | คำเตือน, รอดำเนินการ |
| `danger`  | `#EF4444` | ข้อผิดพลาด, ปฏิเสธ   |
| `info`    | `#3B82F6` | ข้อมูลทั่วไป         |

### 3.4 Neutral Colors

| Token            | Light Mode | Dark Mode | Usage                 |
| ---------------- | ---------- | --------- | --------------------- |
| `background`     | `#F5F5F7`  | `#1C1C1E` | Page background       |
| `surface`        | `#FFFFFF`  | `#2C2C2E` | Card, Dialog, Table   |
| `surface-hover`  | `#F9FAFB`  | `#3A3A3C` | Hover state           |
| `border`         | `#E5E7EB`  | `#48484A` | Borders, Dividers     |
| `text-primary`   | `#1D1D1F`  | `#F5F5F7` | Main text             |
| `text-secondary` | `#6B7280`  | `#A1A1AA` | Secondary text        |
| `text-tertiary`  | `#9CA3AF`  | `#71717A` | Placeholder, Disabled |

### 3.5 Tailwind Configuration

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#F97316",
        },
        secondary: {
          DEFAULT: "#00C781",
          hover: "#00A86B",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#2C2C2E",
        },
        background: {
          light: "#F5F5F7",
          dark: "#1C1C1E",
        },
      },
    },
  },
};
```

### 3.6 Nuxt UI App Config

```ts
// app.config.ts
export default defineAppConfig({
  ui: {
    primary: "orange",
    gray: "zinc",
    button: {
      rounded: "rounded-xl",
    },
    card: {
      rounded: "rounded-2xl",
      shadow: "shadow-sm",
    },
    input: {
      rounded: "rounded-xl",
    },
  },
});
```

---

## 4. Component Styling

### 4.1 Border Radius (Apple-like)

| Element        | Radius | Tailwind Class |
| -------------- | ------ | -------------- |
| Buttons        | 12px   | `rounded-xl`   |
| Cards          | 16px   | `rounded-2xl`  |
| Inputs         | 12px   | `rounded-xl`   |
| Dialogs/Modals | 16px   | `rounded-2xl`  |
| Avatars        | Full   | `rounded-full` |
| Badges         | 8px    | `rounded-lg`   |
| Tables         | 12px   | `rounded-xl`   |

### 4.2 Shadows

| Level  | CSS                            | Usage               |
| ------ | ------------------------------ | ------------------- |
| **sm** | `0 1px 2px rgba(0,0,0,0.05)`   | Cards, Inputs       |
| **md** | `0 4px 6px rgba(0,0,0,0.07)`   | Dropdowns, Popovers |
| **lg** | `0 10px 15px rgba(0,0,0,0.1)`  | Modals, Dialogs     |
| **xl** | `0 20px 25px rgba(0,0,0,0.15)` | Floating panels     |

### 4.3 Spacing Scale

| Token | Size | Usage           |
| ----- | ---- | --------------- |
| `xs`  | 4px  | Icon padding    |
| `sm`  | 8px  | Compact spacing |
| `md`  | 16px | Default spacing |
| `lg`  | 24px | Section spacing |
| `xl`  | 32px | Page padding    |
| `2xl` | 48px | Large gaps      |

---

## 5. Status Badge Colors

ใช้สำหรับแสดงสถานะต่างๆ ในระบบ:

| Status        | Background      | Text               | Border               |
| ------------- | --------------- | ------------------ | -------------------- |
| **PENDING**   | `bg-amber-50`   | `text-amber-700`   | `border-amber-200`   |
| **APPROVED**  | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| **REJECTED**  | `bg-red-50`     | `text-red-700`     | `border-red-200`     |
| **AVAILABLE** | `bg-blue-50`    | `text-blue-700`    | `border-blue-200`    |
| **ASSIGNED**  | `bg-purple-50`  | `text-purple-700`  | `border-purple-200`  |
| **RETIRED**   | `bg-gray-50`    | `text-gray-700`    | `border-gray-200`    |
| **ACTIVE**    | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| **INACTIVE**  | `bg-red-50`     | `text-red-700`     | `border-red-200`     |

---

## 6. Icons

ใช้ **Heroicons** (มาพร้อมกับ Nuxt UI) เป็นชุดไอคอนหลัก:

| Context     | Icon | Name                                   |
| ----------- | ---- | -------------------------------------- |
| Dashboard   | 📊   | `i-heroicons-chart-bar-square`         |
| Employees   | 👥   | `i-heroicons-user-group`               |
| Departments | 🏢   | `i-heroicons-building-office`          |
| Leave       | 🏖️   | `i-heroicons-calendar-days`            |
| Assets      | 💻   | `i-heroicons-computer-desktop`         |
| Performance | 📈   | `i-heroicons-presentation-chart-line`  |
| Expense     | 🧾   | `i-heroicons-receipt-percent`          |
| Settings    | ⚙️   | `i-heroicons-cog-6-tooth`              |
| Logout      | 🚪   | `i-heroicons-arrow-right-on-rectangle` |
| Search      | 🔍   | `i-heroicons-magnifying-glass`         |
| Add         | ➕   | `i-heroicons-plus`                     |
| Edit        | ✏️   | `i-heroicons-pencil-square`            |
| Delete      | 🗑️   | `i-heroicons-trash`                    |
| Approve     | ✅   | `i-heroicons-check-circle`             |
| Reject      | ❌   | `i-heroicons-x-circle`                 |

---

## 7. Dark Mode

### Implementation

```ts
// nuxt.config.ts
colorMode: {
  classSuffix: '',
  preference: 'system',  // ใช้ค่าจากระบบเป็นค่าเริ่มต้น
  fallback: 'light',
}
```

### Color Mapping

| Element         | Light Mode | Dark Mode |
| --------------- | ---------- | --------- |
| Page background | `#F5F5F7`  | `#1C1C1E` |
| Card surface    | `#FFFFFF`  | `#2C2C2E` |
| Primary text    | `#1D1D1F`  | `#F5F5F7` |
| Secondary text  | `#6B7280`  | `#A1A1AA` |
| Border          | `#E5E7EB`  | `#48484A` |
| Primary button  | `#F97316`  | `#FB923C` |
| Sidebar bg      | `#FFFFFF`  | `#2C2C2E` |

### Theme Switcher

ใช้ `<UColorModeButton>` วางไว้ที่ Header ด้านขวา:

```vue
<UColorModeButton />
```

---

## 8. Internationalization (i18n)

### Configuration

```ts
// nuxt.config.ts
i18n: {
  locales: [
    { code: 'en', name: 'English', file: 'en.json' },
    { code: 'th', name: 'ไทย', file: 'th.json' },
  ],
  defaultLocale: 'th',
  lazy: true,
  langDir: 'locales/',
}
```

### Language Switcher

วาง Dropdown เปลี่ยนภาษาไว้ที่ Header:

```vue
<USelect
  v-model="locale"
  :options="[
    { label: 'English', value: 'en' },
    { label: 'ไทย', value: 'th' },
  ]"
  size="sm"
/>
```

### Translation Keys Structure

```json
// locales/en.json
{
  "nav": {
    "dashboard": "Dashboard",
    "employees": "Employees",
    "departments": "Departments",
    "leave": "Leave Management",
    "assets": "Assets",
    "performance": "Performance",
    "settings": "Settings"
  },
  "common": {
    "search": "Search...",
    "add": "Add New",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "status": "Status",
    "actions": "Actions"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "username": "Username",
    "password": "Password"
  }
}
```

```json
// locales/th.json
{
  "nav": {
    "dashboard": "แดชบอร์ด",
    "employees": "พนักงาน",
    "departments": "แผนก",
    "leave": "จัดการวันลา",
    "assets": "ทรัพย์สิน",
    "performance": "ประเมินผลงาน",
    "settings": "ตั้งค่า"
  },
  "common": {
    "search": "ค้นหา...",
    "add": "เพิ่มใหม่",
    "edit": "แก้ไข",
    "delete": "ลบ",
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "confirm": "ยืนยัน",
    "status": "สถานะ",
    "actions": "การดำเนินการ"
  },
  "auth": {
    "login": "เข้าสู่ระบบ",
    "logout": "ออกจากระบบ",
    "username": "ชื่อผู้ใช้",
    "password": "รหัสผ่าน"
  }
}
```

---

## 9. Animation & Transitions

| Element             | Transition        | Duration |
| ------------------- | ----------------- | -------- |
| Page navigation     | Fade + slide      | 200ms    |
| Modal open/close    | Scale + fade      | 150ms    |
| Sidebar collapse    | Width             | 200ms    |
| Hover effects       | Background color  | 150ms    |
| Toast notifications | Slide in from top | 300ms    |
| Dropdown            | Scale Y + fade    | 100ms    |

```css
/* Global transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-in-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
```
