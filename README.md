# Airways_Server
# This is an educational project that is an airline ticket booking system.
It consists of 4 repositories: Airways_Server, Airways_Client, Airways_Admin, Airways_Common
# This is a server for demo airtickets booking system.
# To run the project you need to do the following:
  # clone 4 repos:
    # git clone https://github.com/AndreiPreff/Airways_Server.git
    # git clone https://github.com/AndreiPreff/Airways_Admin.git
    # git clone https://github.com/AndreiPreff/Airways_Client.git
    # git clone https://github.com/AndreiPreff/Airways_Common.git
  # run the command *npm install* in each repo
  # in repo Airways_Client run the command *git submodule update  --remote --merge*
  # in repo Airways_Admin run the command *git submodule update  --remote --merge*
  # in repo Airways_Server you need to run the commands *npx prisma generate* and *npx prisma migrate dev* and *npm run seed*
  # in repo Airways_Server you need to run the commands:
    # *docker-compose up* to run the containers with PostgreSQL, Redis and PGAdmin, 
    # *npm run start* to run the backend
    # *npm run start-chat* to run the chat
  # in repo Airways_Client you need to run the command *npm start* to run the frontend.
  # in repo Airways_Admin you need to run the command *npm start* to run the admin panel.
  

