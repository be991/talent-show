# NUTESA Got Talent NGT1.0 Ticketing System

A modern, light-theme talent show event ticketing system for the "Talent Stardom" university talent competition.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **Payments**: [Paystack](https://paystack.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)

## 📂 Folder Structure

```
src/
├── app/
│   ├── (public)/           # Landing page & Sign In
│   ├── (user)/             # User Dashboard & Ticket Registration
│   └── (admin)/            # Admin Management Dashboard
├── components/
│   ├── atoms/              # Base UI components (Buttons, Inputs)
│   ├── molecules/          # Composite components (FormFields, Cards)
│   ├── organisms/          # Complex sections (Navbars, Dashboards)
│   └── shared/             # Shared utilities
├── lib/                    # SDK initializations & Helpers
├── types/                  # TypeScript interfaces
├── hooks/                  # Custom React hooks
├── constants/              # Pricing & Config constants
└── styles/                 # Global styling
```

## 🛠️ Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    Copy `.env.example` to `.env.local` and fill in the details.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 📅 Development Phases

1.  **Phase 0**: Setup & Planning
2.  **Phase 1**: Foundations & Styles
3.  **Phase 2**: Landing Page & Auth
4.  **Phase 3**: Registration Flows
5.  **Phase 4**: User Dashboard
6.  **Phase 5**: Backend Integration
7.  **Phase 6**: Admin Dashboard Tasks
8.  **Phase 7**: QR Scanner & Messaging
9.  **Phase 8**: Final Testing
