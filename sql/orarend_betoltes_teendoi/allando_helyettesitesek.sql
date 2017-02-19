# Állandó helyettesítések esetén, ha a helyettesítő tanárok órarendje tartalmazza a helyettesített
# tanár óráit akkor ezeket törölni kell

# Barnáné Lukács Erika:

# felhasznaloID:7
# matek tantargyID:2
# 10.A osztalyID:32
# 10.B osztalyID:33
# 9.B osztalyID:29
# fizika tantargyID:3
# 11.D osztalyID:39
# 12.C osztalyID:42

DELETE FROM orak WHERE
orarendID="2011-05-02" AND
felhasznaloID<>7 AND
tantargyID=2 AND
osztalyID IN (29,32,33);

DELETE FROM orak WHERE
orarendID="2011-05-02" AND
felhasznaloID<>7 AND
tantargyID=3 AND
osztalyID IN (39,42);