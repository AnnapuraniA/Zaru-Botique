# PostgreSQL Installation Guide

## Option 1: Install via Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   Follow the prompts and enter your password when asked.

2. **Add Homebrew to your PATH** (if needed):
   ```bash
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```

3. **Install PostgreSQL**:
   ```bash
   brew install postgresql@14
   ```

4. **Start PostgreSQL service**:
   ```bash
   brew services start postgresql@14
   ```

5. **Create the database**:
   ```bash
   createdb arudhra_boutique
   ```
   Or if that doesn't work:
   ```bash
   psql postgres
   ```
   Then in the psql prompt:
   ```sql
   CREATE DATABASE arudhra_boutique;
   \q
   ```

## Option 2: Install Postgres.app (Easier GUI Method)

1. **Download Postgres.app**:
   - Visit: https://postgresapp.com/
   - Download and install the app
   - Move it to your Applications folder

2. **Start Postgres.app**:
   - Open the app from Applications
   - Click "Initialize" if it's the first time
   - The server will start automatically

3. **Create the database**:
   - Open Terminal and run:
   ```bash
   /Applications/Postgres.app/Contents/Versions/latest/bin/psql postgres
   ```
   Then:
   ```sql
   CREATE DATABASE arudhra_boutique;
   \q
   ```

4. **Connection details for TablePlus**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `arudhra_boutique`
   - User: Your macOS username (or `postgres`)
   - Password: (leave empty, or check Postgres.app settings)

## After Installation

Once PostgreSQL is running, you can test the connection in TablePlus with:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `arudhra_boutique`
- **User:** `postgres` (or your macOS username)
- **Password:** (usually empty for local installations)

## Verify Installation

Check if PostgreSQL is running:
```bash
lsof -i :5432
```

You should see a postgres process listening on port 5432.
