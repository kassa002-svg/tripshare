# tripshare

1. **Prerequisites**
- Node.js
- A MongoDB Atlas account
- A Cloudinary account

2. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <repo-url>
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure .env file**

   Copy `.env.example` to a new `.env` and fill in values according to template

   ```
   ATLAS_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority

   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```