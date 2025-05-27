# News App Backend

A NestJS-based backend API for the News Application, providing endpoints for managing news articles and related data.


## Prerequisites

- **Node.js**: Version 16.20.0 (use `nvm` to manage versions: `nvm install 16.20.0`)
- **npm**: Included with Node.js
- **Git**: For cloning the repository ([git-scm.com](https://git-scm.com))
- **Vercel CLI**: For deployment (`npm install -g vercel`)

## Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/tuyenhcmute3010it/AppNew_BE.git
   cd AppNew_BE
   ```

2. Switch to Node.js Version 16.20.0:

   ```bash
   nvm use 16.20.0
   ```

3. Install Dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Configure Environment Variables:

- Create a .env.local file in the project root.
  Add the backend API URL (update to the deployed NestJS backend URL after deployment):
- env
  ```bash
    PORT =8000
    MONGODB_URI=<your mongoDB_URI>
    JWT_ACCESS_TOKEN_SECRET=JUSTASECRET
    JWT_ACCESS_EXPIRE=10d

    JWT_REFRESH_TOKEN_SECRET=JUSTASECRET
    JWT_REFRESH_EXPIRE=100d

    # init sample data
    SHOULD_INIT =true
    INIT_PASSWORD=123456

    # config mail
    EMAIL_HOST=smtp.gmail.com
    EMAIL_AUTH_USER= tuyendaudaihoc3010@gmail.com
    EMAIL_AUTH_PASS=htsrbuvlbzadaljw
    EMAIL_PREVIEW=false
  ```
5. Running Locally

- Start the development server:

   ```bash
   npm run dev
- Open http://localhost:8000 in your browser view api 
