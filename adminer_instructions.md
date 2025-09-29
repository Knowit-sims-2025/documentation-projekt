# Instruktioner för att köra Adminer och importera databas-schema

## 1. Starta Docker
Öppna terminalen och kör:
```bash
docker-compose up -d
```

## 2. Öppna Adminer
Gå till [http://localhost:8080](http://localhost:8080) i din webbläsare.

## 3. Logga in
Fyll i uppgifterna från `docker-compose.yml`:

- **System:** PostgreSQL  
- **Server:** db  
- **Username:** user  
- **Password:** password  
- **Database:** gamification_db  

## 4. Navigera till SQL-kommandon
När du är inloggad, klicka på länken **"SQL command"** i menyn till vänster.

## 5. Kopiera & Klistra in SQL-schema
1. Öppna filen **`db.sql`** i din kod-editor.  
2. Markera all text i filen och kopiera den.  
3. Gå tillbaka till Adminer och klistra in texten i det stora textfältet.  

## 6. Kör!
Klicka på knappen **"Execute"** för att köra kommandona och skapa databasen.
