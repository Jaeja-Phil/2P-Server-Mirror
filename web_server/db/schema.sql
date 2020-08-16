use 2p4p

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `userId` varchar(40) not null UNIQUE,
  `nickname` varchar(15) not null UNIQUE,
  `socialId` varchar(20) UNIQUE,
  `avatarId` int not null default 0,
  `password` varchar(150)
);

CREATE TABLE `gameList` (
  `code` int PRIMARY KEY AUTO_INCREMENT,
  `gameName` varchar(20) not null
);

CREATE TABLE `users_game` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `gameCode` int NOT Null,
  foreign key(`gameCode`) references `gameList`(`code`)
  on delete cascade,
  `userId` int NOT Null,
  foreign key(`userId`) references `users`(`id`)
  on delete cascade
);

CREATE TABLE `playerScore` (
  `scoreId` int not null,
  foreign key(`scoreId`) references `users_game`(`id`)
  on delete cascade,
  `gamesPlayed` int not null,
  `gamesWon` int not null,
  `gamesTied` int not null
);