# SARAP! - A Filipino Themed MealKit Website
A Node.js and Express-based web application designed for browsing, managing, and ordering meal kits. Built as part of a modular MVC (Model-View-Controller) architecture, this application supports dynamic rendering, data loading, user management, and shopping cart operations.

---

## 📁 Repository Structure

```text
mealkit/
├── controllers/
│   ├── cartController.js    # Handles shopping cart business logic & operations
│   ├── generalController.js # Renders core site routes (Home, About, Contact)
│   ├── loadDataController.js# Handles database population/initialization
│   └── mealkitsController.js# Handles meal kit listings, search, and details
├── models/
│   ├── mealkitModel.js      # Database schema for meal kits
│   ├── mealkit-util.js       # Model utilities and helper queries
│   └── userModel.js         # User schema & authentication methods
├── modules/
│   └── mealkit-util.js       # Utility modules for processing meal kit data
├── public/
│   ├── css/
│   │   └── main.css         # Custom styling sheets
│   └── images/              # Static media assets (JPG, PNG, WebP)
├── views/
│   ├── cart/                # Views related to shopping cart checkout/summary
│   ├── general/             # General application views
│   ├── layouts/             # EJS layout wrappers/templates
│   ├── mealkits/            # Meal kit management views (e.g., add-form.ejs)
│   ├── partials/            # Reusable UI partials (header, footer, navbar)
│   ├── error.ejs            # Error page template
│   ├── home.ejs             # Landing/home page view
│   ├── log-in.ejs           # User login view
│   ├── on-the-menu.ejs      # Meal kit menu listing view
│   └── sign-up.ejs          # User registration view
├── package.json             # Project metadata, scripts, and dependencies
└── package-lock.json        # Locked dependency versions
```

🛠️ Tech Stack & Prerequisites
Runtime: Node.js
Framework: Express.js
Templating / Front-End: HTML5, CSS3, EJS
Database: MongoDB / Mongoose

Environment Management: dotenv

🚀 Getting Started
1. Clone the Repository
```Bash
git clone <repository-url>
cd mealkit
```
2. Install Dependencies
```Bash
npm install
```
3. Environment Configuration
Create or update the environment configuration file at config/.env:

```Code snippet
PORT=8080
SESSION_SECRET=your_secret_key
DATABASE_URI=your_database_connection_string
```

4. Seed / Load Initial Data
To populate your database with initial meal kit data, start the application, login as an admin (contact author for admin credentials) then add desired meal kits

```Bash
# Optional setup command if defined in package.json
npm run seed
```
5. Launch the Server
```Bash
npm start
```

⚙️ Key Features
Meal Kit Catalog: Browse through categorized meal offerings with dynamic image loading (.webp, .jpg).

Shopping Cart System: Add, remove, and update kit quantities dynamically (cartController.js).

User Authentication: Sign up, log in, and manage session states (userModel.js).

Data Ingestion: Automated data loading helper (loadDataController.js) to seed sample meals into storage.


> **Note:** Because this project utilizes a MongoDB Atlas free-tier cluster, the database may automatically pause after periods of inactivity. If the live website is not functioning or loading data, please contact the author to wake up the database cluster.
