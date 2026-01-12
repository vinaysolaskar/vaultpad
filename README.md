# 🛡️ Vaultpad

Vaultpad is a simple, private place for your notes. No distractions, just your thoughts.

Live Demo: [https://vaultpad.netlify.app/]

Tech Stack: React, Tailwind CSS, Supabase.

---
## 🚀 Key Features

**Clean Writing Space**: A simple layout inspired by Notion.

**Smart Autosave**: Saves your work automatically 1 second after you stop typing.

**Edit & Sync**: Update your notes anytime; changes sync instantly to the cloud.

**Offline Ready**: Uses local state management so you can keep writing even if your connection dips.

**Mobile Friendly**: Works great on phones and tablets.

---
## 🔐 Security (Privacy First)
**Private by Default**: Only you can see your notes.

**Database Security**: We use "Row Level Security" (RLS). This means the database itself blocks anyone who isn't you.

**Safe Login**: Secure sign-in using Email or Google.

---
## 🛠️ Tech Stack
| Layer            | Technology                     |
|------------------|--------------------------------|
| Frontend         | React + Vite                   |
| Styling          | Tailwind CSS                   |
| Database & Auth  | Supabase (PostgreSQL)          |
| Icons            | Lucide React                   |

---
## 🛠 Setup & Local Development
Clone the project 
  ```bash
    git clone https://github.com/vinaysolaskar/vaultpad.git 
    Install npm install
  ```
Environment Variables:
Create a .env file in the project root with:
  ```bash
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

Supabase Setup

- Create a notes table in Supabase
- Enable Row Level Security
- Add a policy that allows all actions only when: auth.uid() = user_id

Run Locally
  ```bash
    Start npm run dev
  ```

📜 Principles

**Calm**: No tags, no folders, no clutter.

**Secure**: Data ownership is controlled by the database, not just the UI.

**Reliable**: Your notes save automatically so you never lose a word.