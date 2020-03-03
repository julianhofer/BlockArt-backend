-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: sql88.your-server.de
-- Erstellungszeit: 03. Mrz 2020 um 12:22
-- Server-Version: 5.7.29-1
-- PHP-Version: 7.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `blockart`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `ownership`
--

CREATE TABLE `ownership` (
  `user_token` varchar(45) DEFAULT NULL,
  `contract_adress` varchar(100) DEFAULT NULL,
  `artHash` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `ownership`
--

INSERT INTO `ownership` (`user_token`, `contract_adress`, `artHash`) VALUES
('00u13s356xViCxNF44x6', '0xe416eb8ac62354fc3603562096a78571965ddb0b', '0x2b12a12e72407b459e7ea7277c90ffea17de1e68e63eb5cf95db93fd1cbca6a4'),
('00u13q3miRECJwBdZ4x6', '0x97f24f000a446c0df2c7f32e498808449e361164', '0x80beafea96f0fa5ba688e37fef8eae0bbeb7ebdce652f46657bc43f52eaebc26'),
('00u13ql6sI3LLOhYB4x6', '0xb1918b9072c22b6745e05bc0089dae1196c13b55', '0xb26e61656485b5b9ce063b626c5d5c444e8eb0e449fa04ac02e3c81920811452');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_token` varchar(45) NOT NULL,
  `pubKey` varchar(100) NOT NULL,
  `privKey` varchar(100) NOT NULL,
  `isOwner` tinyint(4) NOT NULL,
  `username` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`user_id`, `user_token`, `pubKey`, `privKey`, `isOwner`, `username`) VALUES
(1, '00u13ql6sI3LLOhYB4x6', '0x5610c0e693BD1d3a96108Ef4Ad875658715f4827', '0xD1CB3D820C5C0C26BA51FEDFA044376B1E26CCA2E27A2B3CDE31C41DCE6A882D', 0, 'Vincent'),
(2, '00u13s356xViCxNF44x6', '0x5b3A61104f9Db9488880389F65b33eB0a1710D8B', '0x31478B590215BEAA18720CBD47EADDC8C6FBAC8ACD0BC9C763AEB2F233A0398A', 0, 'Julian'),
(3, '00u13qmephKNaN3uD4x6', '0x28daccf52936b687B9d280ac5d2A034F3338e196', '0xA14B81D91FF77034F78096B0660F1DA15F69C0D76509488CC0E7FE3CED1B2C91', 0, 'Jon'),
(4, '00u13q3miRECJwBdZ4x6', '0x74faA14a5BEb8C3B8f62bAb1057CD9A5A35039A0', '0xA3F17B0933E4A59FFA470C96C98BF7E84B619B0DA99CBA22B4AB6A6169804406', 0, 'Marco');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `ownership`
--
ALTER TABLE `ownership`
  ADD PRIMARY KEY (`artHash`),
  ADD KEY `ownership_idx` (`user_token`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
