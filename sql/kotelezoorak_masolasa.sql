# Az al�bbi lek�rdez�s m�solatot k�sz�t egy �rarend k�telez� �r�ir�l egy m�sik �rarendre

INSERT INTO kotelezoorak

(felhasznaloID,orarendID,het,ora0,ora1,ora2,ora3,ora4)

(SELECT felhasznaloID,'2011-03-10',het,ora0,ora1,ora2,ora3,ora4 FROM kotelezoorak WHERE orarendID='2011-02-28')