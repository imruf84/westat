# Az alábbi lekérdezés törli a szakköröket a megadott felhasználók órarendjébõl

DELETE FROM orak WHERE
felhasznaloID IN(40,90) AND
tantargyID=542;