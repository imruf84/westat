CREATE TABLE IF NOT EXISTS lyukorak (ora INT NOT NULL,PRIMARY KEY(ora)) ENGINE = MEMORY;
INSERT IGNORE INTO lyukorak (ora) VALUES (0);
INSERT IGNORE INTO lyukorak (ora) VALUES (1);
INSERT IGNORE INTO lyukorak  (ora) VALUES (2);
INSERT IGNORE INTO lyukorak (ora) VALUES (3);
INSERT IGNORE INTO lyukorak  (ora) VALUES (4);
INSERT IGNORE INTO lyukorak (ora) VALUES (5);
INSERT IGNORE INTO lyukorak (ora) VALUES (6);
INSERT IGNORE INTO lyukorak  (ora) VALUES (7);
INSERT IGNORE INTO lyukorak  (ora) VALUES (8);
INSERT IGNORE INTO lyukorak (ora) VALUES (9);
INSERT IGNORE INTO lyukorak (ora) VALUES (10);
INSERT IGNORE INTO lyukorak (ora) VALUES (11);
INSERT IGNORE INTO lyukorak (ora) VALUES (12);
INSERT IGNORE INTO lyukorak (ora) VALUES (13);

CREATE TABLE IF NOT EXISTS lyukhetek(het INT NOT NULL,PRIMARY KEY(het)) ENGINE = MEMORY;
INSERT IGNORE INTO lyukhetek(het) VALUES (0);
INSERT IGNORE INTO lyukhetek(het) VALUES (1);

CREATE TABLE IF NOT EXISTS lyuknapok(nap INT NOT NULL,PRIMARY KEY(nap)) ENGINE = MEMORY;
INSERT IGNORE INTO lyuknapok(nap) VALUES (0);
INSERT IGNORE INTO lyuknapok(nap) VALUES (1);
INSERT IGNORE INTO lyuknapok(nap) VALUES (2);
INSERT IGNORE INTO lyuknapok(nap) VALUES (3);
INSERT IGNORE INTO lyuknapok(nap) VALUES (4);


DROP TABLE IF EXISTS lyukasorak;

CREATE TABLE lyukasorak 
SELECT 
t.orarendID AS Órarend,
cs.csoportNev,
f.felhasznaloNev AS Tanár,
CASE t.het
           WHEN 0 THEN 'A'
           WHEN 1 THEN 'B'
END AS Hét,
CASE t.nap
           WHEN 0 THEN 'Hétfõ'
           WHEN 1 THEN 'Kedd'
           WHEN 2 THEN 'Szerda'
           WHEN 3 THEN 'Csütörtök'
           WHEN 4 THEN 'Péntek'
END AS Nap,
t.ora AS Óra

FROM

(SELECT orarendID,felhasznaloID,csopID,het,nap,ora FROM felhasznalok,orarendek,lyukhetek,lyuknapok,lyukorak WHERE orarendID IN ('2013-09-02','2013-09-04','2013-09-09','2013-09-16','2013-09-23','2013-09-30')) t 
 LEFT JOIN felhasznalok f ON f.felhasznaloID=t.felhasznaloID 
 LEFT JOIN csoportok cs ON cs.csoportID=t.csopID 
WHERE
t.ora NOT IN (SELECT ora FROM orak o WHERE t.orarendID=o.orarendID AND t.felhasznaloID=o.felhasznaloID AND t.ora=o.ora AND t.het=o.het AND t.nap=o.nap);


DROP TABLE IF EXISTS lyukorak;
DROP TABLE IF EXISTS lyukhetek;
DROP TABLE IF EXISTS lyuknapok;