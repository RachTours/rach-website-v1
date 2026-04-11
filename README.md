# Rach Tours Website

Tour booking platform for Agadir & Taghazout — WhatsApp integration, admin dashboard, and responsive UI.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL (mysql2)
- **Security**: Helmet, Rate Limiting, JWT Auth, Input Sanitization (express-validator), HPP
- **API**: Meta WhatsApp Cloud API, Google Sheets

## Project Structure

```
├── index.html          # Main page (SPA)
├── server.js           # Express server + security middleware
├── app.js              # Hostinger entry point shim
├── css/                # Stylesheets
├── js/                 # Frontend JavaScript
│   ├── main.js         #   App initializer
│   ├── data.js         #   Tour data + pricing
│   ├── state.js        #   State management
│   ├── reviews.js      #   Review data
│   └── modules/        #   Feature modules
│       ├── reservation.js
│       ├── tours.v2.js
│       ├── reviews-logic.v2.js
│       ├── ui.js
│       └── utils.js
├── src/                # Backend source
│   ├── config/         #   Database config
│   ├── controllers/    #   Route handlers
│   ├── middleware/      #   Auth middleware
│   ├── routes/         #   API routes
│   └── utils/          #   Validators, string utils
├── assets/             # Static assets (fonts, icons)
├── img/                # Tour images
└── .github/workflows/  # CI/CD (security scan)
```

## Setup

1. **Install**:

   ```bash
   npm install
   ```

2. **Configure**: Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. **Run**:

   ```bash
   npm start        # Production
   npm run dev      # Development (with nodemon)
   ```

4. **Visit**: `http://localhost:3005`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Hostinger deployment guide.

## Security

See [SECURITY.md](SECURITY.md) for the security policy and vulnerability reporting.
