# Az alábbi lekérdezés törli a szakköröket a megadott felhasználók órarendjéből

DELETE FROM orak WHERE
felhasznaloID IN(40,90) AND
tantargyID=542;