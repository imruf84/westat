CREATE TABLE westat.csoportok (
csoportID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT  'Csoport azonosítója',
csoportNev VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT  'Csoport neve',
vezetoID INT UNSIGNED NULL DEFAULT NULL COMMENT 'A csoport vezetőjének az azonosítója'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Felhasználók csoportjai';

CREATE TABLE westat.felhasznalok (
felhasznaloID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Felhasználó azonosítója',
felhasznaloNev VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Felhasználó teljes neve',
felhasznaloNevO VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Felhasználó órarendi neve',
felhasznaloNevH VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Felhasználó hiányzás-,helyettesítésbeli neve',
csopID INT UNSIGNED NULL DEFAULT NULL COMMENT 'Felhasználó csoportjának azonosítója',
tipus VARCHAR( 10 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'user' COMMENT 'Felhasználó típusa (admin,leader,operator,user,guest)',
jelszo VARCHAR( 35 ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'A felhasználó jelszava',
oraado TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'A felhasználó óraadó?',
szakoktato TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'A felhasználó szakoktató?'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Felhasználók adatai';

ALTER TABLE csoportok ADD INDEX ( vezetoID );
ALTER TABLE csoportok ADD FOREIGN KEY ( vezetoID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE SET NULL ON UPDATE CASCADE ;

ALTER TABLE felhasznalok ADD INDEX ( csopID );
ALTER TABLE felhasznalok ADD FOREIGN KEY ( csopID ) REFERENCES westat.csoportok ( csoportID ) ON DELETE SET NULL ON UPDATE CASCADE ;

INSERT INTO westat.felhasznalok (felhasznaloID ,felhasznaloNev ,felhasznaloNevO ,felhasznaloNevH ,csopID ,tipus ,jelszo ) VALUES ( NULL , 'root', 'root', 'root', NULL , 'admin' , MD5('lehel') );
INSERT INTO westat.csoportok (csoportNev ,vezetoID ) VALUES ( 'semmi' ,1 );
UPDATE westat.felhasznalok SET csopID = '1' WHERE felhasznalok.felhasznaloID =1;


CREATE TABLE westat.tantargy_cimkek (
tantargyCimkeID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Tantárgycímke azonosítója',
tantargyCimkeNev VARCHAR( 100 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tantárgycímke teljes neve',
tantargyCimkeNevO VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tantárgycímke órarendi neve',
tantargyCimkeNevH VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tantárgycímke hiányzás-,helyettesítésbeli neve'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Tantárgycímkék adatai';

ALTER IGNORE TABLE tantargy_cimkek ADD UNIQUE INDEX(tantargyCimkeNev,tantargyCimkeNevO,tantargyCimkeNevH);


CREATE TABLE westat.tantargyak (
tantargyID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Tantárgy azonosítója',
tantargyNev VARCHAR( 100 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tantárgy teljes neve'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Tantárgyak adatai';

ALTER IGNORE TABLE tantargyak ADD UNIQUE INDEX(tantargyID,tantargyNev);


CREATE TABLE westat.tantargyakcimkei (
tantargyCimkeID INT UNSIGNED NOT NULL COMMENT  'Tantárgycímke azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT  'Tantárgy azonosítója'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Tantáryghoz tartozó címkék';

ALTER TABLE tantargyakcimkei ADD INDEX ( tantargyCimkeID );
ALTER TABLE tantargyakcimkei ADD FOREIGN KEY ( tantargyCimkeID ) REFERENCES westat.tantargy_cimkek ( tantargyCimkeID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER TABLE tantargyakcimkei ADD INDEX ( tantargyID );
ALTER TABLE tantargyakcimkei ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE tantargyakcimkei ADD UNIQUE INDEX(tantargyID,tantargyCimkeID);


CREATE TABLE westat.osztaly_cimkek (
tanevID INT UNSIGNED NOT NULL COMMENT 'Osztálycímke tanévének az azonosítója',
osztalyCimkeID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT  'Osztálycímke azonosítója',
osztalyCimkeNev VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT  'Osztálycímke neve',
osztalyCimkeNevO VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Osztálycímke órarendi neve',
osztalyCimkeNevH VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Osztálycímke hiányzás-,helyettesítésbeli neve'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Osztályok címkéi';

ALTER TABLE osztaly_cimkek ADD INDEX ( tanevID );

ALTER IGNORE TABLE osztaly_cimkek ADD UNIQUE INDEX(tanevID,osztalyCimkeNev,osztalyCimkeNevO,osztalyCimkeNevH);


CREATE TABLE westat.osztalyok (
osztalyID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT  'Osztály azonosítója',
tanevID INT UNSIGNED NOT NULL COMMENT 'Osztály indulásának a tanévének az azonosítója',
kezdoevfolyam TINYINT UNSIGNED NOT NULL DEFAULT '9' COMMENT 'Az osztály kezdő sorszáma',
betujel VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT  'Az osztály betűjele',
idotartam TINYINT UNSIGNED NOT NULL DEFAULT '4' COMMENT 'Az osztály ennyi éves',
tipus VARCHAR( 5 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT  'Osztály típusa (szi=Szakiskola,szki=Szakközépiskola,int=Intenzív,est=Esti,egy=Egyéb)'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Osztályok';

ALTER TABLE osztalyok ADD INDEX ( tanevID );


CREATE TABLE westat.szakmacsoportok (
szakmaCsoportID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Szakmacsoport azonosítója',
szakmaCsoportNev VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Időszak neve'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Szakmacsoportok adatai';


CREATE TABLE westat.osztalycsoportok (
osztalyCsoportID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Osztálycsoport azonosítója',
tanevID INT UNSIGNED NOT NULL COMMENT  'Tanév azonosítója',
osztalyID INT UNSIGNED NOT NULL COMMENT  'Osztály azonosítója',
szakmaCsoportID INT UNSIGNED NOT NULL COMMENT  'Szakmacsoport azonosítója'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Osztálycsoportok adatai';

ALTER TABLE osztalycsoportok ADD INDEX ( tanevID );

ALTER TABLE osztalycsoportok ADD INDEX ( osztalyID );
ALTER TABLE osztalycsoportok ADD FOREIGN KEY ( osztalyID ) REFERENCES westat.osztalyok ( osztalyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER TABLE osztalycsoportok ADD INDEX ( szakmaCsoportID );
ALTER TABLE osztalycsoportok ADD FOREIGN KEY ( szakmaCsoportID ) REFERENCES westat.szakmacsoportok ( szakmaCsoportID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE osztalycsoportok ADD UNIQUE INDEX(tanevID,osztalyID,szakmaCsoportID);


CREATE TABLE westat.osztalyokcimkei (
osztalyCimkeID INT UNSIGNED NOT NULL COMMENT  'Osztálycímke azonosítója',
osztalyID INT UNSIGNED NOT NULL COMMENT  'Osztály azonosítója',
tanevID INT UNSIGNED NOT NULL COMMENT 'Tanév azonosítója'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT =  'Osztályokhoz tartozó címkék';

ALTER TABLE osztalyokcimkei ADD INDEX ( osztalyCimkeID );
ALTER TABLE osztalyokcimkei ADD FOREIGN KEY ( osztalyCimkeID ) REFERENCES westat.osztaly_cimkek ( osztalyCimkeID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER TABLE osztalyokcimkei ADD INDEX ( osztalyID );
ALTER TABLE osztalyokcimkei ADD FOREIGN KEY ( osztalyID ) REFERENCES westat.osztalyok ( osztalyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER TABLE osztalyokcimkei ADD INDEX ( tanevID );

ALTER IGNORE TABLE osztalyokcimkei ADD UNIQUE INDEX(osztalyID,osztalyCimkeID,tanevID);


CREATE TABLE westat.tanevek (
tanevID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Tanév azonosítója',
tanevNev VARCHAR( 10 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'A tanév neve',
elsoNap DATE NOT NULL COMMENT 'A tanév első tanítási napja',
utolsoNap DATE NOT NULL COMMENT 'A tanév utolsó tanítási napja'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Tanévek adatai';



# Ezeket külön itt cvsatoljuk, hogy elkerüljük az SQL hibáját (ahol az osztaly_cimkek táblát létrehozzuk még nem létezik a tanevek tábla).
ALTER TABLE osztaly_cimkek ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE osztalyok ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE osztalycsoportok ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE osztalyokcimkei ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;



CREATE TABLE westat.idoszakok (
idoszakID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Időszak azonosítója',
idoszakNev VARCHAR( 11 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Időszak neve',
tanevID INT UNSIGNED NOT NULL COMMENT 'Időszak tanévének az azonosítója',
kezdoHetElsoNap DATE NOT NULL COMMENT 'Időszak kezdő hetének első napja',
kezdoHetSorszam INT UNSIGNED NOT NULL COMMENT 'Időszak kezdő hetének naptárbeli sorszáma',
kezdoHetBetujel VARCHAR( 1 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT  'Időszak kezdő hetének a betűjele (A,B)',
elsoNap DATE NOT NULL COMMENT 'Időszak első napja',
utolsoNap DATE NOT NULL COMMENT 'Időszak utolsó napja'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Időszakok adatai';
ALTER TABLE idoszakok ADD INDEX ( tanevID );
ALTER TABLE idoszakok ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.orarendek (
orarendID VARCHAR( 15 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Órarend azonosítója (érvényesség dátuma)',
tanevID INT UNSIGNED NOT NULL COMMENT 'Időszak tanévének az azonosítója',
PRIMARY KEY ( orarendID ) 
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Órarendek adatai';
ALTER TABLE orarendek ADD INDEX ( tanevID );
ALTER TABLE orarendek ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.orak (
orarendID VARCHAR( 15 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Az órát tartalmazó órarend azonosítója',
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'Az órát tartó tanár azonosítója',
osztalyID INT UNSIGNED NOT NULL COMMENT 'Az órán résztvevő osztály azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT 'Az órán megtartott tantárgy azonosítója',
het TINYINT UNSIGNED NOT NULL COMMENT 'Az óra hetének sorszáma (A=0)',
nap TINYINT UNSIGNED NOT NULL COMMENT 'Az óra napjának sorszáma (Hétfő=0)',
ora TINYINT UNSIGNED NOT NULL COMMENT 'Az óra sorszáma'
) ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Órák adatai';
ALTER TABLE orak ADD INDEX ( orarendID );
ALTER TABLE orak ADD INDEX ( felhasznaloID );
ALTER TABLE orak ADD INDEX ( osztalyID );
ALTER TABLE orak ADD INDEX ( tantargyID );
ALTER TABLE orak ADD FOREIGN KEY ( orarendID ) REFERENCES westat.orarendek ( orarendID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE orak ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE orak ADD FOREIGN KEY ( osztalyID ) REFERENCES westat.osztalyok ( osztalyID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE orak ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.hianyzasokai (
hianyzasokaID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Hiányzás okának azonosítója',
hianyzasokaNev VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Hiányzás okának neve',
hianyzasokaNevH VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Hiányzás okának állománybeli neve',
tamogatott TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'A hiányzás támogatott-e?'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Hiányáz okainak adatai';

CREATE TABLE westat.hianyzasok (
hianyzasID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Hiányzás azonosítója',
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A hiányzó felhasználó azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A hiányzás időszakának azonosítója',
osztalyID INT UNSIGNED NOT NULL COMMENT 'Az elmaradt óra osztályának azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT 'Az elmaradt óra tantárgyának azonosítója',
ora TINYINT UNSIGNED NOT NULL COMMENT 'Az elmaradt óra sorszáma',
datum DATE NOT NULL COMMENT 'Az elmaradt óra dátuma',
hianyzasokaID INT UNSIGNED NOT NULL COMMENT 'A hiányzás oka',
igazolt TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'A hiányzás igazolt-e?'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Hiányzások adatai';
ALTER TABLE hianyzasok ADD INDEX ( felhasznaloID );
ALTER TABLE hianyzasok ADD INDEX ( idoszakID );
ALTER TABLE hianyzasok ADD INDEX ( osztalyID );
ALTER TABLE hianyzasok ADD INDEX ( tantargyID );
ALTER TABLE hianyzasok ADD INDEX ( hianyzasokaID );
ALTER TABLE hianyzasok ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE hianyzasok ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE hianyzasok ADD FOREIGN KEY ( osztalyID ) REFERENCES westat.osztalyok ( osztalyID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE hianyzasok ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE hianyzasok ADD FOREIGN KEY ( hianyzasokaID ) REFERENCES westat.hianyzasokai ( hianyzasokaID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE hianyzasok ADD UNIQUE INDEX(felhasznaloID,idoszakID,osztalyID,tantargyID,ora,datum,hianyzasokaID);

CREATE TABLE westat.helyettesitestipusai (
helyettesitestipusaID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Helyettesítés típusának azonosítója',
helyettesitestipusaNev VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Helyettesítés típusának neve',
helyettesitestipusaNevH VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Helyettesítés típusának állománybeli neve',
osszevont TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'A helyettesítés összevont-e?'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Helyettesítés típusainak adatai';

CREATE TABLE westat.helyettesitesek (
helyettesitesID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Helyettesítés azonosítója',
helyettesitoID INT UNSIGNED NOT NULL COMMENT 'A helyettesítő felhasználó azonosítója',
helyettesitettID INT UNSIGNED NULL DEFAULT NULL COMMENT 'A helyettesített felhasználó azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A helyettesítés időszakának azonosítója',
osztalyID INT UNSIGNED NOT NULL COMMENT 'Az helyettesített óra osztályának azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT 'Az helyettesített óra tantárgyának azonosítója',
ora TINYINT UNSIGNED NOT NULL COMMENT 'Az helyettesített óra sorszáma',
datum DATE NOT NULL COMMENT 'Az helyettesített óra dátuma',
helyettesitestipusaID INT UNSIGNED NOT NULL COMMENT 'A helyettesítés típusa',
torolve TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'A helyettesítés törölt-e?'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Helyettesítések adatai';
ALTER TABLE helyettesitesek ADD INDEX ( helyettesitoID );
ALTER TABLE helyettesitesek ADD INDEX ( helyettesitettID );
ALTER TABLE helyettesitesek ADD INDEX ( idoszakID );
ALTER TABLE helyettesitesek ADD INDEX ( osztalyID );
ALTER TABLE helyettesitesek ADD INDEX ( tantargyID );
ALTER TABLE helyettesitesek ADD INDEX ( helyettesitestipusaID );
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( helyettesitoID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( helyettesitettID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE SET NULL ON UPDATE CASCADE ;
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( osztalyID ) REFERENCES westat.osztalyok ( osztalyID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE helyettesitesek ADD FOREIGN KEY ( helyettesitestipusaID ) REFERENCES westat.helyettesitestipusai ( helyettesitestipusaID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE helyettesitesek ADD UNIQUE INDEX(helyettesitoID,idoszakID,osztalyID,tantargyID,ora,datum,helyettesitestipusaID);

CREATE TABLE westat.jelentesek (
idoszakID INT UNSIGNED NOT NULL COMMENT 'Jelentés időszakának az azonosítója',
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'Jelentés felhasználójának az azonosítója',
content MEDIUMBLOB NOT NULL COMMENT 'Jelentés tartalma'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Jelentések adatai';
ALTER TABLE jelentesek ADD INDEX ( idoszakID );
ALTER TABLE jelentesek ADD INDEX ( felhasznaloID );
ALTER TABLE jelentesek ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE jelentesek ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;


CREATE TABLE westat.kotelezoorak (
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A kötelező óra felhasználójának az azonosítója',
orarendID VARCHAR( 15 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'A kötelező óra órarendjének az azonosítója',
het TINYINT UNSIGNED NOT NULL COMMENT 'A kötelező óra hetének a sorszáma (A=0)',
ora0 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A hétfői kötelező órák száma',
ora1 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A keddi kötelező órák száma',
ora2 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A szerdai kötelező órák száma',
ora3 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A csütörtöki kötelező órák száma',
ora4 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A pénteki kötelező órák száma',
tulora00 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A hétfői első túlóra sorszáma',
tulora01 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A hétfői második túlóra sorszáma',
tulora10 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A keddi első túlóra sorszáma',
tulora11 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A keddi második túlóra sorszáma',
tulora20 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A szerdai első túlóra sorszáma',
tulora21 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A szerdai második túlóra sorszáma',
tulora30 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A csütörtöki első túlóra sorszáma',
tulora31 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A csütörtöki második túlóra sorszáma',
tulora40 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A pénteki első túlóra sorszáma',
tulora41 TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'A pénteki második túlóra sorszáma'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Kötelező órák adatai';
ALTER TABLE kotelezoorak ADD INDEX ( felhasznaloID );
ALTER TABLE kotelezoorak ADD INDEX ( orarendID );
ALTER TABLE kotelezoorak ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE kotelezoorak ADD FOREIGN KEY ( orarendID ) REFERENCES westat.orarendek ( orarendID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.egyeniorakedv (
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'Az egyéni órakedvezmény felhasználójának az azonosítója',
tanevID INT UNSIGNED NOT NULL COMMENT 'Az egyéni órakedvezményhez tartozó tanév azonosítója',
oraA TINYINT UNSIGNED NOT NULL COMMENT 'Egyéni órakedvezmény (''A'' hét)',
oraKotelezoA FLOAT NOT NULL COMMENT 'Kötelező óraszámban elszámolt egyéni órakedvezmény (''A'' hét)',
oraB TINYINT UNSIGNED NOT NULL COMMENT 'Egyéni órakedvezmény (''B'' hét)',
oraKotelezoB FLOAT NOT NULL COMMENT 'Kötelező óraszámban elszámolt egyéni órakedvezmény (''B'' hét)'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Egyéni órakedvezmények adatai';
ALTER TABLE egyeniorakedv ADD INDEX ( felhasznaloID );
ALTER TABLE egyeniorakedv ADD INDEX ( tanevID );
ALTER TABLE egyeniorakedv ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE egyeniorakedv ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.rnapok (
rnapID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT  'Rendhagyó nap azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A rendhagyó nap időszakának az azonosítója',
tipus VARCHAR( 10 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'ikn' COMMENT 'Rendhagyó nap típusa (ikn=Időszakon kívüli nap,mszn=Munkaszüneti nap,tnm=Tanítás nélküli munkanap,kon=Kötelező óra szerinti nap,kono=Kötelező óra szerinti nap adott osztállyal,aono=Adott óraszám szerinti nap adott osztállyal,hn=Helyettesített nap,onaoao=Órarend szerinti nap adott órától adott óráig)',
datum DATE NOT NULL COMMENT 'A rendhagyó nap dátuma',
megjegyzes VARCHAR( 30 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Rendhagyó naphoz tartozó megjegyzés',
hnDatum DATE NULL DEFAULT NULL COMMENT 'A hn típusú nap dátuma',
hnHet VARCHAR( 1 ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT  'A hn típusú nap hetének a betűjele (A,B)',
konoOsztalyNev VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'kono típusú nap osztályának a neve',
aonoOsztalyNev VARCHAR( 20 ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'aono típusú nap osztályának a neve',
aonoOraszam TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'aono típusú nap oraszáma',
onaoaoOratol TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'onaoao típusú nap órától mezője',
onaoaoOraig TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'onaoao típusú nap óráig mezője'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Időszak rendhagyó napjai';
ALTER TABLE rnapok ADD INDEX ( idoszakID );
ALTER TABLE rnapok ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;

CREATE TABLE westat.tktef (
tktefID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'Tanórán kívüli tevékenység azonosítója',
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A tanórán kívüli tevékenységet végző felhasználó azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A helyettesítés időszakának azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT 'A tanórán kívüli tevékenység (tantárgy) azonosítója',
oraszam TINYINT UNSIGNED NOT NULL COMMENT 'A tanórán kívüli tevékenység óraszáma',
datum DATE NOT NULL COMMENT 'Az tanórán kívüli tevékenység dátuma',
dijazott TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'A tanórán kívüli tevékenység díjazott-e?',
csoportos TINYINT( 1 ) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'A tanórán kívüli tevékenység csoportos-e?'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Tanórán kívüli tevékenységek adatai';
ALTER TABLE tktef ADD INDEX ( felhasznaloID );
ALTER TABLE tktef ADD INDEX ( idoszakID );
ALTER TABLE tktef ADD INDEX ( tantargyID );
ALTER TABLE tktef ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE tktef ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE tktef ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE tktef ADD UNIQUE INDEX(datum,idoszakID,tantargyID,felhasznaloID,dijazott);

CREATE TABLE westat.kiadottparancsok (
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A parancsot kiadó tanár azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A parancsra vonatkozó időszak azonosítója',
parancs VARCHAR( 30 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'A kiadott parancs'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'A felhasználók által kiadott parancsok adatai';
ALTER TABLE kiadottparancsok ADD INDEX ( felhasznaloID );
ALTER TABLE kiadottparancsok ADD INDEX ( idoszakID );
ALTER TABLE kiadottparancsok ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE kiadottparancsok ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE kiadottparancsok ADD UNIQUE INDEX(felhasznaloID,idoszakID,parancs);

CREATE TABLE westat.lezarasok (
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A lezárással rendelkező tanár azonosítója',
idoszakID INT UNSIGNED NOT NULL COMMENT 'A lezárással rendelkező időszak azonosítója'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Időszakok lezárásainak az adatai';
ALTER TABLE lezarasok ADD INDEX ( felhasznaloID );
ALTER TABLE lezarasok ADD INDEX ( idoszakID );
ALTER TABLE lezarasok ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE lezarasok ADD FOREIGN KEY ( idoszakID ) REFERENCES westat.idoszakok ( idoszakID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE lezarasok ADD UNIQUE INDEX(felhasznaloID,idoszakID);

CREATE TABLE westat.tantargyelsz (
tanevID INT UNSIGNED NOT NULL COMMENT 'Tantárgyelszámolás tanévének az azonosítója',
felhasznaloID INT UNSIGNED NOT NULL COMMENT 'A tantrágyelszámolással rendelkező tanár azonosítója',
tantargyID INT UNSIGNED NOT NULL COMMENT 'Tantárgyelszámolás tantárgyának az azonosítója',
tipus VARCHAR( 5 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'elm' COMMENT 'Tantárgyelszámolás típusa (elm=Elméleti,gyak=Gyakorlati,tkt=Tanórán kívüli tevékenység,ef=Egyéni foglalkozás,tktgy=Tanórán kívüli tevékenység (gyakorlat),efgy=Egyéni foglalkozás (gyakorlat))',
szakfelsz TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Szakfeladat elszámolás (csak óraadó esetén) (0=Szf. nélkül,1=Felnőttk.,2=Szki,3=Szi,4=Szakképzés.5=Koll.)'
) ENGINE = InnoDB CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT = 'Időszakok lezárásainak az adatai';
ALTER TABLE tantargyelsz ADD INDEX ( tanevID );
ALTER TABLE tantargyelsz ADD INDEX ( felhasznaloID );
ALTER TABLE tantargyelsz ADD INDEX ( tantargyID );
ALTER TABLE tantargyelsz ADD FOREIGN KEY ( tanevID ) REFERENCES westat.tanevek ( tanevID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE tantargyelsz ADD FOREIGN KEY ( felhasznaloID ) REFERENCES westat.felhasznalok ( felhasznaloID ) ON DELETE CASCADE ON UPDATE CASCADE ;
ALTER TABLE tantargyelsz ADD FOREIGN KEY ( tantargyID ) REFERENCES westat.tantargyak ( tantargyID ) ON DELETE CASCADE ON UPDATE CASCADE ;

ALTER IGNORE TABLE tantargyelsz ADD UNIQUE INDEX(tanevID,felhasznaloID,tantargyID,tipus,szakfelsz);