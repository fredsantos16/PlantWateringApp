# PlantWateringApp

run backend
    npm start

run frontend
    flutter run

run database
    pg_ctl -D "C:\Program Files\PostgreSQL\17\data" start
    pg_ctl status
    psql -U postgres

git commands
    git status
    git ls-files

    create a new branch for a new feature
        git checkout -b feature/api-endpoints
        
    pulling code from branch (Your code is now up to date with what’s on GitHub!)
        git pull origin main

    commiting to a branch (Files are now committed, but only locally!)
        git add .
        git commit -m "Added authentication API & fixed login bug"

    pushing code to branch (Now, your changes are visible on GitHub!)
        git push origin feature/api-endpoints
    
    merging branch to main (Now, feature/api-endpoints changes are added to main!)
        git checkout main
        git merge feature/api-endpoints

    deleting branch
        git branch -d feature-login

    viewing recent commits
        git log --oneline

        this is a test again
        